/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../shared/api/axiosClient';

export const fetchAllQuestions = createAsyncThunk('manager/fetchAllQuestions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/question');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi lấy câu hỏi!');
  }
});

export const fetchQuestionById = createAsyncThunk('manager/fetchQuestionById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(`/question/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi lấy chi tiết câu hỏi!');
  }
});

export const addQuestion = createAsyncThunk('manager/addQuestion', async (questionData: any, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/question', questionData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi thêm câu hỏi!');
  }
});

export const updateQuestion = createAsyncThunk('manager/updateQuestion', async ({ id, questionData }: { id: string; questionData: any }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put(`/question/${id}`, questionData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật câu hỏi!');
  }
});

export const deleteQuestion = createAsyncThunk('manager/deleteQuestion', async (id: string, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/question/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi xóa câu hỏi!');
  }
});

interface ManagerState {
  questions: any[];
  currentQuestion: any;
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null
};

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchAllQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload);
      });
  }
});

export default managerSlice.reducer;
