const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in...', async () => {
  beforeEach(async () => {
    await page.login();
    await page.waitFor('a.btn-floating');
    await page.click('a.btn-floating');
    await page.waitFor('.blogForm');
  });

  test('case of redirecting to blogs after login', async () => {
    expect(await page.getContentsOf('.blogForm label')).toEqual('Blog Title');
  });

  describe('and using invalid inputs...', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('Form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });

  describe('and using valid inputs...', async () => {

    beforeEach(async () => {
      await page.type('.title input', 'Test title');
      await page.type('.content input', 'Test content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blogs to index page', async () => {
      await page.click('button.green');

      await page.waitFor('.card-stacked:last-child .card-title');
      const title = await page.getContentsOf('.card-stacked:last-child .card-title');
      const content = await page.getContentsOf('.card-stacked:last-child .card-content p');

      expect(title).toEqual('Test title');
      expect(content).toEqual('Test content');
    });
  });
});

describe('When not logged in...', async () => {
  beforeEach(async () => {

  });
  test('making request to save a blog received an error', async () => {
    const response = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'My unused title', content: 'My unused content' }),
      }).then(res => res.json());
    });

    expect(response).toEqual({ error: 'You must log in!' });

  });
});

