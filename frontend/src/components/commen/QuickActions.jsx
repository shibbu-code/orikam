import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid2X2,
  Tags,
  Info,
  Phone,
} from "lucide-react";
import "./QuickActions.css";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Categories",
      icon: Grid2X2,
      path: "/categories",
    },
    {
      label: "Brands",
      icon: Tags,
      path: "/brands",
    },
    {
      label: "About Us",
      icon: Info,
      path: "/about",
    },
    {
      label: "Contact",
      icon: Phone,
      path: "/contact",
    },
  ];

  return (
    <section className="quick-actions">
      <div className="quick-actions-container">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="quick-action"
              onClick={() => navigate(action.path)}
            >
              <Icon size={20} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActions;