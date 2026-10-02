import { expect, test } from '@playwright/test'

test('실제 서버 소비를 기존 예산 카드와 소비 탑 5에서 조회한다', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/my$/)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page).toHaveURL(/\/my$/)
  await expect(page.getByText('씀 12,000원', { exact: true })).toBeVisible()
  await expect(page.getByText('데모 저녁', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '월간', exact: true }).click()
  await expect(page.getByText('씀 72,700원', { exact: true })).toBeVisible()
  await expect(page.getByText('데모 마트', { exact: true })).toBeVisible()
  await expect(page.locator('#phone-frame')).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(5)

  // 기존 화면에 없는 임의 날짜 조회·또래 비교는 API 계약으로 검증한다.
  const token = await page.evaluate(() => sessionStorage.getItem('finmate-token'))
  const headers = { Authorization: `Bearer ${token}` }
  const overview = await page.request.get('/api/v1/me/overview?period=monthly&date=2026-06-30', { headers })
  expect(await overview.json()).toMatchObject({ start: '2026-06-01', end: '2026-06-30', source: 'SYNTHETIC', budget: { spent: 72600 } })
  const transactions = await page.request.get('/api/v1/me/transactions?period=monthly&date=2026-06-30&page=0&size=20', { headers })
  expect(await transactions.json()).toMatchObject({ total: 8, items: expect.arrayContaining([expect.objectContaining({ merchant: '데모 저녁', amount: -12000 })]) })
  const peers = await page.request.get('/api/v1/me/peers?month=2026-06-01', { headers })
  expect(await peers.json()).toMatchObject({ peerCount: 24, mySpend: 72600, peerAvgSpend: 187600, source: 'SYNTHETIC' })
})

test('서버 실패를 카드 안에 표시하고 기존 탭을 유지하며 다시 조회한다', async ({ page }) => {
  await page.route('**/api/v1/me/overview*', route => route.fulfill({ status: 503, body: '{}' }))
  await page.goto('/')
  await expect(page).toHaveURL(/\/my$/)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('alert')).toContainText('불러오지 못했습니다')
  await expect(page.getByText(/^씀 /)).toHaveCount(0)
  await expect(page.getByRole('navigation').getByRole('link', { name: '피드', exact: true })).toBeVisible()
  await page.unroute('**/api/v1/me/overview*')
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click()
  await expect(page.getByText('씀 12,000원', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('미적재 기간 응답은 소비 0원으로 바꾸지 않고 기존 카드의 빈 상태로 표시한다', async ({ page }) => {
  await page.route('**/api/v1/me/overview*', async route => {
    const url = new URL(route.request().url())
    url.searchParams.set('date', '2026-08-31')
    const response = await route.fetch({ url: url.toString() })
    expect(await response.json()).toMatchObject({ dataStatus: 'NO_DATA', budget: null })
    await route.fulfill({ response })
  })
  await page.goto('/')
  await expect(page).toHaveURL(/\/my$/)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('status')).toContainText('자료가 없는 기간')
  await expect(page.getByText(/^씀 /)).toHaveCount(0)
  await expect(page.getByText('데모 저녁', { exact: true })).toHaveCount(0)
  await expect(page.locator('#phone-frame')).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(5)
})
