import google.generativeai as genai
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from google.api_core import exceptions

load_dotenv()

class HistoryService:
    def __init__(self):
        # Em 2026, utilizamos o modelo estável Gemini 3 Flash
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    async def generate_ucronia(self, event: str, change: str):
        prompt = f"""
        Você é um historiador especialista em ucronias.
        Analise o evento: "{event}" com a mudança: "{change}".
        
        Gere uma linha do tempo, coordenadas geográficas e um "Registro Visual" (descrição para IA).
        Avalie o nível de ruptura histórica desta mudança em uma escala de 1 a 10.
        Retorne também uma breve análise do risco de paradoxo (ex: se a mudança impede o nascimento de figuras chave).
        
        Sua resposta deve ser ESTRITAMENTE um JSON puro:
        {{
            "original_event": "{event}",
            "divergence_point": "Resumo de 5 palavras",
            "timeline": [
                {{ "year": 1900, "event_name": "Nome", "description": "Texto", "real_world_equivalent": "Texto" }}
            ],
            "impact_locations": [
                {{ "lat": -8.05, "lng": -34.88, "label": "Nome do local" }}
            ],
            "visual_record_prompt": "Descrição detalhada para geração de imagem artística/histórica",
            "summary": "Impacto global",
            "magnitude": 8,
            "risk_analysis": "Ao alterar a vitória em Guararapes, criamos uma divergência que impede a consolidação territorial do Brasil, gerando um risco alto de fragmentação colonial."
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
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
            data['paradox_risk'] = min(100, int(raw_risk))

            # Agora sim, geramos a imagem usando o prompt que a IA criou
            # image_url = await self.generate_image(data.get('visual_record_prompt', 'Cenário histórico abstrato'))
            # data['image_url'] = image_url

            return data

        except exceptions.ResourceExhausted:
            return {"error": "QUOTA", "summary": "Aguarde 30 segundos."}
        except Exception as e:
            print(f"Erro no pipeline: {e}")
            raise e

    async def generate_image(self, visual_prompt: str):
        """Tenta a geração com o modelo Nano Banana Pro detectado na sua lista"""
        try:
            # Usando o identificador exato da sua listagem
            model_id = 'gemini-2.5-flash-image'
            image_model = genai.GenerativeModel(model_id)
            
            # Executa a geração do registro visual
            result = image_model.generate_content(visual_prompt)
            
            filename = f"ucronia_{os.urandom(4).hex()}.png"
            image_path = os.path.join("app", "static", "images", filename)
            
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            
            # Extração dos bytes da imagem gerada pelo Nano Banana Pro
            image_data = result.candidates[0].content.parts[0].inline_data.data
            with open(image_path, "wb") as f:
                f.write(image_data)
                
            print(f"Sucesso! O registro visual foi capturado pelo {model_id}.")
            return f"/static/images/{filename}"
            
        except exceptions.ResourceExhausted:
            # Caso o limite ainda persista, mantemos o fail-safe
            print(f"A cota do {model_id} também está no limite. A 'banana' ainda está verde!")
            return None
        except Exception as e:
            print(f"Erro técnico com o {model_id}: {e}")
            return None
        