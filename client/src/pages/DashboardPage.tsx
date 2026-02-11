import { IUserAPI } from "../api/users/IUserAPI";
import React from "react";

type DashboardPageProps = {
    userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI }) => {
    return (
        <div className="dashboard-root">
            {/* Page content */}
                <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        </div>
    );
};