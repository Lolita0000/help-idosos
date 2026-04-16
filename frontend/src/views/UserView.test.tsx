import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import UserView from "./UserView"

describe("UserView", () => {
  it("deve renderizar logo, texto e botão começar", () => {
    render(<UserView />)

    expect(screen.getByAltText("Elo de Cuidado")).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: /começar/i })
    ).toBeInTheDocument()

    expect(
     screen.getByText((content) =>
  content.includes("Cuidando de quem você") &&
  content.includes("ama, juntos")
)
    ).toBeInTheDocument()
  })
})