from google import genai
from google.genai import types
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
from google.api_core import exceptions
from .repositories import UcroniaRepository

load_dotenv()
RESOURCES_DIR = Path(__file__).parent.parent / "resources"

class HistoryService:
    def __init__(self, repository: UcroniaRepository = None):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_id = "gemini-3-flash-preview" 
        self.repository = repository
        self.prompts = self._load_prompts()
        
    def _load_prompts(self):
        prompt_path = RESOURCES_DIR / "prompts.json"
        
        if not prompt_path.exists():
            raise FileNotFoundError(f"Não encontrei o prompts.json em: {prompt_path}")
            
        with open(prompt_path, "r", encoding="utf-8") as f:
            return json.load(f)

    async def generate_ucronia(self, event: str, change: str, parent_id: int = None):
        parent_risk = 0
        contexto_pai = ""
        
        # Se houver um pai, buscamos o conteúdo dele para dar contexto à IA
        if parent_id and self.repository:
            ucronia_pai = self.repository.get_by_id(parent_id)
            if ucronia_pai:
                dados_pai = json.loads(ucronia_pai.content)
                parent_risk = dados_pai.get('paradox_risk', 0)
                contexto_pai = f"Esta é uma ramificação da seguinte realidade alternativa: {dados_pai['summary']}. "
                
        template_config = self.prompts["historian_v1"]
        
        # Formata o prompt injetando as variáveis
        full_prompt = template_config["user_template"].format(
            contexto_pai=contexto_pai,
            event=event,
            change=change
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json" 
                )
            )
            raw_text = response.text.strip()

            start_index = raw_text.find('{')
            end_index = raw_text.rfind('}')

            if start_index == -1 or end_index == -1:
                raise ValueError("JSON não encontrado na resposta.")

            json_str = raw_text[start_index:end_index + 1].replace('\n', ' ').replace('\r', '')
            
            # ORDEM CORRETA: Transforma em dicionário primeiro
            data = json.loads(json_str)
            # Cálculo do Risco
            current_year = datetime.now().year
            year_of_change = data['timeline'][0]['year']
            delta_t = abs(current_year - year_of_change)
            magnitude = data.get('magnitude', 5)

            # Lógica: Eventos muito antigos com alta magnitude tendem a 100%
            raw_risk = (delta_t * magnitude) / 20
            current_impact = min(100, int(raw_risk))
            data['paradox_risk'] = min(100, int(parent_risk + current_impact))
            
            if self.repository:
                self.repository.save(event, change, data, parent_id=parent_id)

            return data

        except exceptions.ResourceExhausted:
            return {"error": "QUOTA", "summary": "Aguarde 30 segundos."}
        except Exception as e:
            print(f"Erro no pipeline: {e}")
            raise e

   