// tests/integration/userController.test.js
const request = require('supertest');
const app = require('../../../app');
const path = require('path');
const User = require('../../../models/user');

describe('User Controller', () => {
  it('successfully uploads profile picture(s)', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

    // Upload image
    const response = await agent
      .post('/user/edit')
      .field('first', 'Craig')
      .field('last', 'Roberts')
      .attach(
        'pic',
        path.join(__dirname, '../../fixtures/good-test-image.jpg')
      );

    expect(response.status).toBe(302);

    const user = await User.findByUsername('JSmith1');
    expect(user.hasPic).toBeTruthy();
  });

  it('does not upload profile picture when too big', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

    // Upload image
    const response = await agent
      .post('/user/edit')
      .field('first', 'Craig')
      .field('last', 'Roberts')
      .attach(
        'pic',
        path.join(__dirname, '../../fixtures/too-big-test-image.jpg')
      );

    expect(response.status).toBe(302);

    const user = await User.findByUsername('JSmith1');
    expect(user.hasPic).toBeFalsy();
  });

  it('does not upload profile picture when wrong file type', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'JSmith1', password: 'password' });

    // Upload image
    const response = await agent
      .post('/user/edit')
      .field('first', 'Craig')
      .field('last', 'Roberts')
      .attach(
        'pic',
        path.join(__dirname, '../../fixtures/wrong-type-test-image.txt')
      );

    expect(response.status).toBe(302);

    const user = await User.findByUsername('JSmith1');
    expect(user.hasPic).toBeFalsy();
  });
});
