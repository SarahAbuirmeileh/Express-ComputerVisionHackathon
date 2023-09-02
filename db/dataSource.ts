import { DataSource } from "typeorm";
import { Logger } from "./entities/logger.js";

const dataSource = new DataSource({
  type: 'mysql',
  host: 'geeky-scripters.ckxcq2pvrc9s.eu-west-2.rds.amazonaws.com',
  port: 3306,
  username: 'root',
  password: '123456789',
  database: 'Hackathon',
  entities: [Logger],
  synchronize: true,
  logging: true
});

dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

export default dataSource;