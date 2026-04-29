import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import UserView from "@/views/components/logo/UserView"

describe("UserView", () => {
  it("should render button and text", () => {
    render(<UserView />)

    expect(
      screen.getByRole("button", { name: /começar/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Cuidando de quem você.*ama, juntos/i)
    ).toBeInTheDocument()
  })
})