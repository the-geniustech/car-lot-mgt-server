import { config, configDotenv } from 'dotenv';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import { join, resolve } from 'path';

// import Car from '../../models/carModel.js';
// import User from '../../models/userModel.js';
import Review from '../../models/reviewModel.js';

configDotenv();
config({ path: './config.env' });
// Get the filename of the current module
// const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
// const __dirname = path.dirname(__filename);

// console.log('Filename:', __filename);
// console.log('Directory:', __dirname);

const rootDir = resolve();
// const carsPath = join(rootDir, 'dev-data', 'data', 'cars.json');
// const usersPath = join(rootDir, 'dev-data', 'data', 'users.json');
const reviewsPath = join(rootDir, 'reviews.json');

// const cars = JSON.parse(readFileSync(carsPath));
// const users = JSON.parse(readFileSync(usersPath));
const reviews = JSON.parse(readFileSync(reviewsPath));

const DB = process.env.DB;
console.log(DB);
console.log(process.env.COOKIE_KEY);

mongoose
  .connect(
    'mongodb+srv://blogappapi:Y1iFLPiVd1Ch0cWO@cluster0.mzx1toh.mongodb.net/CarLot?retryWrites=true&w=majority&appName=Cluster0',
  )
  .then(() => console.log('Database successfully connected'))
  .catch((error) => console.log('Database UNSUCCESSFULLY connected', error));

const importData = async () => {
  try {
    // await Car.create(cars);
    // await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    // await Car.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

switch (process.argv[2]) {
  case '--import':
    importData();
    break;
  case '--delete':
    deleteData();
    break;
  default:
    break;
}

importData();
