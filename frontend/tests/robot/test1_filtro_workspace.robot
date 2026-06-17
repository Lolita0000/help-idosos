*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}       http://localhost:5173
${BROWSER}   chrome

*** Test Cases ***
Filtro Todos Deve Exibir Dois Workspaces
    [Documentation]    TC-01: estado inicial com filtro "Todos" deve exibir 2 cards
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//h4[contains(text(),'Meus Workspaces')]    timeout=10s
    ${qtd}=    Get Element Count    css:.MuiCard-root
    Should Be Equal As Integers    ${qtd}    2
    [Teardown]    Close Browser

Filtro Admin Deve Exibir Apenas Workspace Com Papel Admin
    [Documentation]    TC-02: filtro "Admin" deve exibir somente o workspace com papel Admin
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//h4[contains(text(),'Meus Workspaces')]    timeout=10s
    Click Element    xpath=//button[contains(.,'Admin')]
    Wait Until Page Does Not Contain    Pós cirurgia do Tio Alberto    timeout=5s
    ${qtd}=    Get Element Count    css:.MuiCard-root
    Should Be Equal As Integers    ${qtd}    1
    Element Should Contain    css:.MuiCard-root    Cuidados com a Vovó Joana
    [Teardown]    Close Browser

Filtro Membro Deve Exibir Apenas Workspace Com Papel Membro
    [Documentation]    TC-03: filtro "Membro" deve exibir somente o workspace com papel Membro
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//h4[contains(text(),'Meus Workspaces')]    timeout=10s
    Click Element    xpath=//button[contains(.,'Membro')]
    Wait Until Page Does Not Contain    Cuidados com a Vovó Joana    timeout=5s
    ${qtd}=    Get Element Count    css:.MuiCard-root
    Should Be Equal As Integers    ${qtd}    1
    Element Should Contain    css:.MuiCard-root    Pós cirurgia do Tio Alberto
    [Teardown]    Close Browser
