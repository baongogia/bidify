import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminModerationPage from './pages/AdminModerationPage';
import AdminSellerApplicationsPage from './pages/AdminSellerApplicationsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ApplySellerPage from './pages/ApplySellerPage';
import CheckoutPage from './pages/CheckoutPage';
import CreateProductPage from './pages/CreateProductPage';
import LoginPage from './pages/LoginPage';
import MySellerApplicationPage from './pages/MySellerApplicationPage';
import NotificationsPage from './pages/NotificationsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductListPage from './pages/ProductListPage';
import RegisterPage from './pages/RegisterPage';
import SellerProductsPage from './pages/SellerProductsPage';
import WatchlistPage from './pages/WatchlistPage';

const App = () => {
	return (
		<AuthProvider>
			<ModalProvider>
				<BrowserRouter>
				<div className="flex flex-col min-h-screen">
					<Navbar />
					<main className="flex-1 bg-gray-50/50">
						<Routes>
							<Route path="/" element={<ProductListPage />} />
							<Route path="/products/:id" element={<ProductDetailPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route
						path="/create-product"
						element={(
							<PrivateRoute>
								<CreateProductPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/apply-seller"
						element={(
							<PrivateRoute>
								<ApplySellerPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/my-seller-application"
						element={(
							<PrivateRoute>
								<MySellerApplicationPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/watchlist"
						element={(
							<PrivateRoute>
								<WatchlistPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/checkout/:id"
						element={(
							<PrivateRoute>
								<CheckoutPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/notifications"
						element={(
							<PrivateRoute>
								<NotificationsPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/seller/products"
						element={(
							<PrivateRoute>
								<SellerProductsPage />
							</PrivateRoute>
						)}
					/>
					<Route
						path="/admin"
						element={(
							<AdminRoute>
								<AdminLayout><AdminDashboardPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route
						path="/admin/users"
						element={(
							<AdminRoute>
								<AdminLayout><AdminUsersPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route
						path="/admin/moderation"
						element={(
							<AdminRoute>
								<AdminLayout><AdminModerationPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route
						path="/admin/seller-applications"
						element={(
							<AdminRoute>
								<AdminLayout><AdminSellerApplicationsPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route
						path="/admin/settings"
						element={(
							<AdminRoute>
								<AdminLayout><AdminSettingsPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route
						path="/admin/categories"
						element={(
							<AdminRoute>
								<AdminLayout><AdminCategoriesPage /></AdminLayout>
							</AdminRoute>
						)}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</main>
					<Footer />
				</div>
			</BrowserRouter>
			</ModalProvider>
		</AuthProvider>
	);
};

export default App;
