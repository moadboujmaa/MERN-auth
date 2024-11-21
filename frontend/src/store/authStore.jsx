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

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (err) {
			set({ error: err.response.data.message || "Error signing up", isLoading: false });
			throw err;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, isLoading: false });
		} catch (err) {
			set({ error: err.response.data.message || "Error signing up", isLoading: false });
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
	},

	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isCheckingAuth: false, isAuthenticated: true })
		} catch (err) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false })
		}
	}
}))
