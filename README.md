# com-oy-ld-image-gen

ESL LD IMAGE 관련 프로젝트

## 1. VSCODE EXTENSION 설치

- LIVE SERVER : HTML 파일을 브라우저에서 바로 확인할 수 있도록 도와주는 확장 프로그램

## 2. 의존성 설치

> nodejs LTS 버전 설치 하는 것을 권장함.

```bash
npm i
```

## 3. 환경설정

> .env.example 파일을 복사하여 .env 파일을 생성 후 관련 설정 정보를 입력한다.

```bash
# LD IMAGE 관련
PRODUCT_FILE_PATH : 참조 상품목록 정보 파일 (json)
XSL_FILE_PATH : 템플릿 설정 파일 (xsl)

# IMAGE DIFF 관련
N/A
```

## 4. 실행

```bash
# LD IMAGE 관련
npm run start

# IMAGE DIFF 관련 - 임시 확인 용도
npm run diff
```

## 5. 결과확인

```bash
# 아래 폴더에 생성 된 결과물을 확인한다

## LD IMAGE 관련
/output/ld/

## IMAGE DIFF 관련
/output/diff/
```
