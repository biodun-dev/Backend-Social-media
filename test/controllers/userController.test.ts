import request from 'supertest';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User';
import app from '../../src/app'; 
import logger from '../../src/utils/logger'; 

describe('User Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const saveStub = sinon.stub(User.prototype, 'save').resolves();
      const loggerStub = sinon.stub(logger, 'info');

      const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.text).toBe('User registered successfully');
      expect(saveStub.calledOnce).toBe(true);
      expect(loggerStub.calledWith(sinon.match(`User registered successfully: ${userData.username}`))).toBe(true);
    });

    it('should handle errors during registration', async () => {
      const saveStub = sinon.stub(User.prototype, 'save').rejects(new Error('Error saving user'));

      const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(500);

      expect(saveStub.calledOnce).toBe(true);
      expect(response.body.message).toBe('Error saving user'); // Match the actual error message
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const user = {
        _id: 'userId',
        email: 'test@example.com',
        comparePassword: sinon.stub().resolves(true)
      };

      const findOneStub = sinon.stub(User, 'findOne').resolves(user);
      const loggerStub = sinon.stub(logger, 'info');

      const loginData = { email: 'test@example.com', password: 'password123' };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined(); // Check that the token is defined

      // Verify token structure and payload
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as { id: string };
      expect(decoded.id).toBe(user._id);

      expect(findOneStub.calledOnceWith({ email: 'test@example.com' })).toBe(true);
      expect(user.comparePassword.calledOnceWith('password123')).toBe(true);
      expect(loggerStub.calledWith(sinon.match(`User logged in successfully: ${loginData.email}`))).toBe(true);
    });

    it('should handle authentication failure', async () => {
      const findOneStub = sinon.stub(User, 'findOne').resolves(null);
      const loggerStub = sinon.stub(logger, 'warn');

      const loginData = { email: 'test@example.com', password: 'password123' };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.text).toBe('Authentication failed');
      expect(findOneStub.calledOnceWith({ email: 'test@example.com' })).toBe(true);
      expect(loggerStub.calledWith(sinon.match('Authentication failed for email: test@example.com'))).toBe(true);
    });
  });
});
