import {initialState,ingredients} from '../../src/data.js';
// Generous real stock for tests whose subject is ranking rather than ingredient availability.
export function stockedState(){const s=initialState();s.stock=Object.values(ingredients).map(i=>({id:'stock-'+i.id,ingredientId:i.id,qty:10000,unit:i.unit,status:'available',acquiredAt:'2026-09-01'}));return s;}
