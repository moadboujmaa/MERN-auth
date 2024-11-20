import { create } from "zustand"
import axios from "axios"

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,

	signup: async (email, password, name) => {
		set({isLoading: true, error: null});
		try {
			const response = await axios.post(`${API_URL}/signup`, {email, password, name});
			set({user: response.data.user, isAuthenticated: true, isLoading: false});
		} catch (err) {
			set({error: err.response.data.message || "Error signing up", isLoading: false});
			throw err;
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null});

		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code })
			set({ user: response.data.user, isLoading: false, isAuthenticated: true })
		} catch(err) {
			set({error: err.response.data.message || "Error verifying email", isLoading: false})
			throw err;
		}
	}
}))
