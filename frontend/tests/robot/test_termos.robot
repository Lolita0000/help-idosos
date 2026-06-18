*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}                 http://localhost:5176/
${BROWSER}             chrome

*** Test Cases ***
CT-01 - Cadastro sem aceitar os termos
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
    Location Should Be    ${URL}
    Close Browser

CT-02 - Cadastro aceitando os termos
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//input[@placeholder='Digite seu nome..']    timeout=10s
    Input Text    xpath=//input[@placeholder='Digite seu nome..']    Maria Teste
    Input Text    xpath=//input[@placeholder='Digite seu CPF..']    123.456.789-00
    Input Text    xpath=//input[@placeholder='Digite seu e-mail..']    maria@email.com
    Input Password    xpath=//input[@placeholder='Crie uma senha forte']    Senha@123
    Input Password    xpath=//input[@placeholder='Digite a senha novamente']    Senha@123
    Select Checkbox    xpath=//input[@type='checkbox']
    Click Button    xpath=//button[contains(text(),'Registrar')]
    Sleep    3s
    Close Browser