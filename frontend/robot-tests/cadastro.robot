*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário acessa a tela de cadastro
Suite Teardown    Fecha o navegador

*** Variables ***
${URL}              http://localhost:5173
${BROWSER}          chrome
${INPUT_NOME}       //*[@id="root"]/div/main/form/div[1]/div[1]/div/input
${INPUT_CPF}        //*[@id="root"]/div/main/form/div[1]/div[2]/div/input
${INPUT_EMAIL}      //*[@id="root"]/div/main/form/div[1]/div[3]/div/input
${INPUT_SENHA}      //*[@id="root"]/div/main/form/div[1]/div[4]/div/input
${INPUT_CONFIRMAR}  //*[@id="root"]/div/main/form/div[1]/div[5]/div/input
${BOTAO_CADASTRAR}  //*[@id="root"]/div/main/form/button

*** Test Cases ***
CT01 - Deve realizar cadastro com dados válidos
    Dado que o usuário informa o nome       João Silva
    E informa o CPF                         123.456.789-09
    E informa o email                       joao@email.com
    E informa a senha                       12345678
    E confirma a senha                      12345678
    Quando solicitar o cadastro
    Então o sistema não deve sair da página de cadastro

CT02 - Deve bloquear envio com nome vazio
    Dado que o usuário informa o nome       ${EMPTY}
    E informa o CPF                         123.456.789-09
    E informa o email                       joao@email.com
    E informa a senha                       12345678
    E confirma a senha                      12345678
    Quando solicitar o cadastro
    Então o sistema não deve sair da página de cadastro

CT03 - Deve bloquear envio com email inválido
    Dado que o usuário informa o nome       João Silva
    E informa o CPF                         123.456.789-09
    E informa o email                       emailinvalido
    E informa a senha                       12345678
    E confirma a senha                      12345678
    Quando solicitar o cadastro
    Então o sistema não deve sair da página de cadastro

*** Keywords ***
Dado que o usuário acessa a tela de cadastro
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Dado que o usuário informa o nome
    [Arguments]    ${nome}
    Run Keyword If    '${nome}' != '${EMPTY}'    Input Text    ${INPUT_NOME}    ${nome}

E informa o CPF
    [Arguments]    ${cpf}
    Input Text    ${INPUT_CPF}    ${cpf}

E informa o email
    [Arguments]    ${email}
    Input Text    ${INPUT_EMAIL}    ${email}

E informa a senha
    [Arguments]    ${senha}
    Input Password    ${INPUT_SENHA}    ${senha}

E confirma a senha
    [Arguments]    ${confirmar}
    Input Password    ${INPUT_CONFIRMAR}    ${confirmar}

Quando solicitar o cadastro
    Click Button    ${BOTAO_CADASTRAR}
    Sleep    1s

Então o sistema não deve sair da página de cadastro
    Location Should Be    ${URL}/

Fecha o navegador
    Close Browser