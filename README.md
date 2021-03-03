# bshs-attend-ws
QR코드를 이용한 등교체크. 기존의 

## 개괄
* 사용자의 스마트폰에 설치하는 애플리케이션과 연동되어 사용하는 QR코드를 이용하여 만든 출입관제시스템
* 부산고교 차세대 학생지원 시스템과 연동되어 사용하는 카드 없는 출석시스템

## 실시사항
* HTML5 표준을 준수하는 기술을 이용: WEBSOCKET (NO ACTIVE-X, NO FLASH)
* 빠른 응답속도를 위해 IN-MEMORY DB를 채택 (REDIS DB)

## 효용
* 카트 인식 시스템과 병용 가능
* 신규 시스템 도입 시 필요한 장치의 도입이 제한적
* 기존 이용중인 시스템의 장비를 이용해 신규도입이 가능함
* NFC인증 시스템과 대비해 NFC기능을 사용할 수 없는 기기도 인증 가능함
* 직접접촉이 없으며, 빠른 인식률을 자랑하는 QR코드를 인식의 매개로 사용하였기에 출입자가 몰리는 상황을 방지할 수 있다.

### 기획안 다운로드
https://365pen-my.sharepoint.com/:w:/g/personal/khskeb0513_o365_pen_go_kr/EUVdakQhh2FPhz7AVqRdDhsBHx-e_5ilpWTwacoqqm2M4w?e=midPH2
