import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FarmerDashboardPage } from './FarmerDashboardPage'
import { useFarmerStore } from './farmer.store'

describe('FarmerDashboardPage', () => {
  beforeEach(() => {
    useFarmerStore.getState().reset()
  })

  it('renders the farmer dashboard summary', () => {
    render(
      <MemoryRouter>
        <FarmerDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /farmer dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create batch/i })).toBeInTheDocument()
  })
})
