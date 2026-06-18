*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}                 http://localhost:5176/
${BROWSER}             chrome

*** Test Cases ***
CT-01 - Cadastro com dados válidos
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//input[@placeholder='Digite seu nome..']    timeout=10s
    Input Text    xpath=//input[@placeholder='Digite seu nome..']    Maria Teste
    Input Text    xpath=//input[@placeholder='Digite seu CPF..']    123.456.789-00
    Input Text    xpath=//input[@placeholder='Digite seu e-mail..']    maria@email.com
    Input Password    xpath=//input[@placeholder='Crie uma senha forte']    Senha@123
    Input Password    xpath=//input[@placeholder='Digite a senha novamente']    Senha@123
    Click Button    xpath=//button[contains(text(),'Registrar')]
    Sleep    3s
    Close Browser

CT-02 - Verificar visibilidade da senha
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//input[@placeholder='Crie uma senha forte']    timeout=10s
    Input Password    xpath=//input[@placeholder='Crie uma senha forte']    Senha@123
    ${tipo_antes}=    Get Element Attribute    xpath=//input[@placeholder='Crie uma senha forte']    type
    Should Be Equal    ${tipo_antes}    password
    Click Element    xpath=//input[@placeholder='Crie uma senha forte']/following-sibling::*
    ${tipo_depois}=    Get Element Attribute    xpath=//input[@placeholder='Crie uma senha forte']    type
    Should Be Equal    ${tipo_depois}    text
    Close Browser