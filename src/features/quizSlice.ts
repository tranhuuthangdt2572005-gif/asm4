/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../shared/api/axiosClient';

export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/quizzes');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi kéo đề thi!');
  }
});

export const fetchQuizById = createAsyncThunk('quiz/fetchQuizById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(`/quizzes/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi lấy chi tiết đề thi!');
  }
});

export const addQuiz = createAsyncThunk('quiz/addQuiz', async (quizData: any, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/quizzes', quizData);
    return { ...quizData, _id: response.data._id, questions: quizData.questions || [] };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi thêm đề thi!');
  }
});

export const updateQuiz = createAsyncThunk('quiz/updateQuiz', async ({ id, quizData }: { id: string; quizData: any }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put(`/quizzes/${id}`, quizData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật đề thi!');
  }
});

export const deleteQuiz = createAsyncThunk('quiz/deleteQuiz', async (id: string, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/quizzes/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi xóa đề thi!');
  }
});

export const createQuestionForQuiz = createAsyncThunk('quiz/createQuestionForQuiz', async ({ quizId, questionData }: { quizId: string; questionData: any }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(`/quizzes/${quizId}/question`, questionData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi thêm câu hỏi vào đề thi!');
  }
});

export const createManyQuestionsForQuiz = createAsyncThunk('quiz/createManyQuestionsForQuiz', async ({ quizId, questions }: { quizId: string; questions: any[] }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(`/quizzes/${quizId}/questions`, questions);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi thêm nhiều câu hỏi vào đề thi!');
  }
});

interface QuizState {
  list: any[];
  currentQuiz: any;
  currentQuestionIndex: number;
  score: number;
  isCompleted: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  list: [],
  currentQuiz: null,
  currentQuestionIndex: 0,
  score: 0,
  isCompleted: false,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    selectQuiz: (state, action) => {
      state.currentQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isCompleted = false;
    },
    submitAnswer: (state, action) => {
      const selectedIndex = action.payload;
      const currentQuestion = state.currentQuiz.questions[state.currentQuestionIndex];
      
      if (selectedIndex === currentQuestion.correctAnswerIndex) {
        state.score += 1;
      }

      if (state.currentQuestionIndex + 1 < state.currentQuiz.questions.length) {
        state.currentQuestionIndex += 1;
      } else {
        state.isCompleted = true;
      }
    },
    restartQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isCompleted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.list.findIndex(quiz => quiz._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.list = state.list.filter(quiz => quiz._id !== action.payload);
      });
  },
});

export const { selectQuiz, submitAnswer, restartQuiz } = quizSlice.actions;
export default quizSlice.reducer;
