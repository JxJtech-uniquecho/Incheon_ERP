import os
from mistralai import Mistral

# 1. API 클라이언트 초기화 (환경 변수에 MISTRAL_API_KEY 등록 필요)
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

# 2. 대시보드 로우 데이터 예시 (실제 환경에서는 DB나 내부 API에서 조회)
dashboard_payload = {
    "period": "2026-Q2",
    "metrics": {
        "DAU": 152000,
        "MoM_DAU_Growth_Percent": 12.5,
        "Revenue_USD": 452000,
        "Conversion_Rate_Percent": 3.2,
        "Churn_Rate_Percent": 1.8
    },
    "anomalies": [
        {"date": "2026-05-14", "issue": "결제 게이트웨이 오류로 인한 2시간 동안의 매출 일시 급감"}
    ]
}

# 3. 페르소나 및 출력 지침 정의 (System Instruction)
system_instruction = (
    "당신은 전문 비즈니스 분석가입니다. 제공된 대시보드 JSON 데이터를 바탕으로 "
    "경영진이 한눈에 파악할 수 있는 요약 리포트를 작성하세요. "
    "반드시 다음 3가지 섹션을 포함해야 합니다:\n"
    "1. 핵심 성과 요약 (주요 지표의 성과 요약)\n"
    "2. 특이사항 분석 (이상치나 하락한 지표에 대한 원인 추정)\n"
    "3. 추천 액션 아이템 (향후 개선을 위한 전략적 제안)\n"
    "톤앤매너는 전문적이고 간결해야 하며, 주관적인 추측은 배제하고 데이터에 기반해야 합니다."
)

user_message = f"다음 대시보드 데이터를 분석하여 리포트를 작성해 주세요:\n{dashboard_payload}"

# 4. Mistral API 호출
try:
    response = client.chat.complete(
        model="mistral-small-latest",  # 텍스트 요약에 효율적인 Small 모델 지정
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_message}
        ],
        temperature=0.2,  # 데이터 분석의 정확성을 위해 일관성 높은 낮은 온도 설정
        max_tokens=1000
    )
    
    # 5. 결과 활용
    ai_summary = response.choices[0].message.content
    print("=== AI Generated Dashboard Summary ===")
    print(ai_summary)

except Exception as e:
    print(f"API 호출 중 오류가 발생했습니다: {e}")