export interface mochaHooks {
  beforeAll(): Promise<void>;

  afterAll(): Promise<void>;
}

export default mochaHooks;
