import request from 'supertest';
import app from '../server';  
import db from '../config/firebase'; 
import axios from 'axios';


jest.mock('axios');
jest.mock('../config/firebase', () => ({
  ref: jest.fn(),
  database: jest.fn().mockReturnValue({
    ref: jest.fn(),
  }),
}));

describe('User API', () => {

  const mockUser = {
    name: 'user1',
    zip: '27704',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
  };

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  test('should create a new user', async () => {
    axios.get.mockResolvedValue({
      data: {
        coord: { lat: mockUser.latitude, lon: mockUser.longitude },
        timezone: mockUser.timezone,
      },
    });

    const mockSet = jest.fn().mockResolvedValue('success'); 
    const mockPush = jest.fn().mockReturnValue({ set: mockSet }); 

    db.ref = jest.fn().mockReturnValue({ push: mockPush });

    const response = await request(app)
      .post('/users')
      .send({ name: mockUser.name, zip: mockUser.zip });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: mockUser.name,
      zip: mockUser.zip,
      latitude: mockUser.latitude,
      longitude: mockUser.longitude,
      timezone: mockUser.timezone,
    });

    expect(mockPush).toHaveBeenCalled(); 
    expect(mockSet).toHaveBeenCalledWith({
      name: mockUser.name,
      zip: mockUser.zip,
      latitude: mockUser.latitude,
      longitude: mockUser.longitude,
      timezone: mockUser.timezone,
    }); 
  });

  test('should return 400 if name or zip is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: '', zip: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name and ZIP code are required.');
  });

  test('should return 400 if zip code is invalid', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: mockUser.name, zip: '1234A' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Please enter a valid 5-digit ZIP code.');
  });

  test('should get all users', async () => {
    const users = [
      { id: '1', name: 'User One', zip: '27704', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
      { id: '2', name: 'User Two', zip: '67890', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
    ];

    db.ref.mockReturnValue({
      once: jest.fn().mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        forEach: (callback) => {
          users.forEach((user) => {
            callback({
              key: user.id,
              val: () => user,
            });
          });
        },
      }),
    });

    const response = await request(app).get('/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject(users[0]);
  });

  test('should get user by ID', async () => {
    const user = { id: '1', name: 'User One', zip: '12345', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' };

    db.ref.mockReturnValue({
      child: jest.fn().mockReturnValue({
        once: jest.fn().mockResolvedValue({
          exists: jest.fn().mockReturnValue(true),
          val: jest.fn().mockReturnValue(user), 
        }),
      }),
    });
        

    const response = await request(app).get('/users/1');
    
    expect(response.status).toBe(200);
    expect(response._body).toEqual(user);
  });

  test('should return 404 if user not found by ID', async () => {
    db.ref.mockReturnValue({
      child: jest.fn().mockReturnValue({
        once: jest.fn().mockResolvedValue({ exists: jest.fn().mockReturnValue(false) }),
      }),
    });

    const response = await request(app).get('/users/999');
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test('should update a user', async () => {
    const updatedUser = { name: 'updated user', zip: '21225' };

    axios.get.mockResolvedValue({
      data: {
        coord: { lat: 37.7749, lon: -122.4194 },
        timezone: 'America/Los_Angeles',
      },
    });

    db.ref.mockReturnValue({
      child: jest.fn().mockReturnValue({
        once: jest.fn().mockResolvedValue({
          exists: jest.fn().mockReturnValue(true),
          val: () => ({ id: '1', name: 'User One', zip: '27704', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' }),
        }),
        update: jest.fn(),
      }),
    });

    const response = await request(app)
      .put('/users/1')
      .send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedUser.name);
    expect(response.body.zip).toBe(updatedUser.zip);
  });

  test('should delete a user', async () => {
    db.ref.mockReturnValue({
      child: jest.fn().mockReturnValue({
        remove: jest.fn(),
      }),
    });

    const response = await request(app).delete('/users/1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });
});
