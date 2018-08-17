const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

test('logo has right text', async (done) => {

  await page.waitFor('a.brand-logo');
  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster');

  done();
});

test('clicking login starts Auth flow', async (done) => {
  await page.waitFor('.right .login-link');
  await page.click('.right .login-link');

  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);

  done();
});

test('when sign in shows logout button', async () => {
  await page.login();
  await page.waitFor('.right .blog-link');

  const text = await page.getContentsOf('.right .blog-link');
  expect(text).toEqual('My Blogs');
});



