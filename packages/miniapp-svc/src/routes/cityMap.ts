import { Router } from 'express';
import {
  listAttractions,
  getAttraction,
  listFoods,
  getFood,
  listHeritages,
  getWeather,
} from '../controllers/cityMap';

const router = Router();

router.get('/attractions', listAttractions);
router.get('/attractions/:id', getAttraction);
router.get('/foods', listFoods);
router.get('/foods/:id', getFood);
router.get('/heritages', listHeritages);
router.get('/weather', getWeather);

export default router;
