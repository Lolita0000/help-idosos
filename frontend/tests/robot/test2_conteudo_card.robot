*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}       http://localhost:5173
${BROWSER}   chrome

*** Test Cases ***
Card Com Papel Admin Deve Exibir Dados Corretos
    [Documentation]    TC-04: card do workspace Admin deve exibir nome, criador, pessoa, membros e papel
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//h4[contains(text(),'Meus Workspaces')]    timeout=10s
    ${card}=    Get WebElement    xpath=(//div[contains(@class,'MuiCard-root')])[1]
    Element Should Contain    ${card}    Cuidados com a Vovó Joana
    Element Should Contain    ${card}    Carlos Pereira
    Element Should Contain    ${card}    Joana
    Element Should Contain    ${card}    3 membros
    Element Should Contain    ${card}    Admin
    [Teardown]    Close Browser

Card Com Papel Membro Deve Exibir Dados Corretos
    [Documentation]    TC-05: card do workspace Membro deve exibir nome, criador, pessoa, membros e papel
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//h4[contains(text(),'Meus Workspaces')]    timeout=10s
    ${card}=    Get WebElement    xpath=(//div[contains(@class,'MuiCard-root')])[2]
    Element Should Contain    ${card}    Pós cirurgia do Tio Alberto
    Element Should Contain    ${card}    Julia Silva
    Element Should Contain    ${card}    Alberto
    Element Should Contain    ${card}    5 membros
    Element Should Contain    ${card}    Membro
    [Teardown]    Close Browser
