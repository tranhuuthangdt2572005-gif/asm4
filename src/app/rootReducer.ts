import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import quizReducer from '../features/quizSlice';
import managerReducer from '../features/managerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  quiz: quizReducer,
  manager: managerReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
