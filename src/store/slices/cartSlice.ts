import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '@/services/ApiService';

export const fetchCart = createAsyncThunk('cart/fetch', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await ApiService.get(`/cart/${userId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data: { user_id: string, product_id: string, quantity: number }, { rejectWithValue }) => {
  try {
    const response = await ApiService.post('/cart/add', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to add to cart');
  }
});

interface CartState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
          // Optimistic update or refetch can be handled here
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
