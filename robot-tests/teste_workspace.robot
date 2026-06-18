*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:5179/

*** Test Cases ***
CT-UI-05 - Tela de Workspace - Filtro de Workspaces
    Open Browser    ${URL}    chrome
    Maximize Browser Window

    Page Should Contain    Cuidados com a Vovó Joana
    Page Should Contain    Pós cirurgia do Tio Alberto

    Click Button    Membro
    Page Should Contain    Pós cirurgia do Tio Alberto

    Click Button    Admin
    Page Should Contain    Cuidados com a Vovó Joana

    Click Button    Todos
    Page Should Contain    Cuidados com a Vovó Joana
    Page Should Contain    Pós cirurgia do Tio Alberto

    Close Browser


CT-UI-06 - Tela de Workspace - Botão Criar Novo Workspace
    Open Browser    ${URL}    chrome
    Maximize Browser Window

   Page Should Contain    Criar novo workspace

    Close Browser