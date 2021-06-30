require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns a new todo item when creating new todo item', async() => {

      const expectation = [
        {
          id: 6,
          todo: 'vacuum',
          completed: false,
          user_id: 2,
        },
        {
          id: 7,
          todo: 'change Meli substrate',
          completed: false,
          user_id: 2,
        },
        {
          id: 8,
          todo: 'fold clothes',
          completed: false,
          user_id: 2,
        }
      ];
      
      for (let todo of expectation) {
        await fakeRequest(app)
          .post('/api/todos')
          .send(todo)
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200);
      }
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('/GET todos', async() => {

      const expectation = [
        {
          id: 6,
          todo: 'vacuum',
          completed: false,
          user_id: 2,
        },
        {
          id: 7,
          todo: 'change Meli substrate',
          completed: false,
          user_id: 2,
        },
        {
          id: 8,
          todo: 'fold clothes',
          completed: false,
          user_id: 2,
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('/POST todos creates a new todo item', async() => {
      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send({
          id: 9,
          todo: 'clean litter box',
          completed: false,
          user_id: 2,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const dataTodo = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const newTodo = [{
        id: 9,
        todo: 'clean litter box',
        completed: false,
        user_id: 2,
      }];

      const postedTodo = [
        { 
          'completed': false, 
          'id': 6, 
          'todo': 'vacuum', 
          'user_id': 2 
        }, 
        { 'completed': false, 
          'id': 7, 
          'todo': 'change Meli substrate', 
          'user_id': 2 
        }, 
        { 
          'completed': false, 
          'id': 8, 
          'todo': 'fold clothes', 
          'user_id': 2 
        }, 
        { 
          'completed': false, 
          'id': 9, 
          'todo': 'clean litter box', 
          'user_id': 2 
        }
      ];

      expect(data.body).toEqual(newTodo);
      expect(dataTodo.body).toEqual(postedTodo);
    });

    test('/PUT new todo', async() => {

      const expectation = [
        { 
          'completed': false, 
          'id': 6, 
          'todo': 'vacuum', 
          'user_id': 2 
        }, 
        { 'completed': false, 
          'id': 7, 
          'todo': 'change Meli substrate', 
          'user_id': 2 
        }, 
        { 
          'completed': false, 
          'id': 8, 
          'todo': 'fold clothes', 
          'user_id': 2 
        }, 
        { 
          'completed': true, 
          'id': 9, 
          'todo': 'clean litter box', 
          'user_id': 2 
        }
      ];

      await fakeRequest(app)
        .put('/api/todos/9')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const dataTodo = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(dataTodo.body).toEqual(expectation);

    });
  });
});
