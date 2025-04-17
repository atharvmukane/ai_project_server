import express, { Router } from 'express';
import { addEditItem, deleteItem, fetchAllItem } from './item.controller';

export const ItemRoutes: Router = express.Router();

//api/item/addEditItem
ItemRoutes.post('/addEditItem', addEditItem);

//api/item/fetchAllItem
ItemRoutes.post('/fetchAllItem', fetchAllItem);

//api/item/deleteItem
ItemRoutes.get('/deleteItem/:id', deleteItem);