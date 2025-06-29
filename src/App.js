
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { meals as initialMeals } from './data/meals';

function App() {
  const [meals, setMeals] = useState(() => {
    try {
      const savedMeals = localStorage.getItem('meals');
      if (savedMeals) {
        return JSON.parse(savedMeals);
      } else {
        return initialMeals;
      }
    } catch (error) {
      console.error("Could not parse meals from localStorage", error);
      return initialMeals;
    }
  });
  const [weekMenu, setWeekMenu] = useState(() => {
    try {
      const savedMenu = localStorage.getItem('weekMenu');
      return savedMenu ? JSON.parse(savedMenu) : [];
    } catch (error) {
      console.error("Could not parse weekMenu from localStorage", error);
      return [];
    }
  });
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast' });
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('weekMenu', JSON.stringify(weekMenu));
  }, [weekMenu]);

  const generateMenu = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let availableMeals = JSON.parse(JSON.stringify(meals));
    let menu = [];
    let previousDayMeals = [];

    for (const day of days) {
      let dailyMenu = { day, breakfast: null, lunch: null, dinner: null };
      let usedMealsToday = [];

      // Breakfast
      let meal = getRandomMeal(availableMeals.breakfast, usedMealsToday, previousDayMeals);
      dailyMenu.breakfast = meal;
      if (meal) usedMealsToday.push(meal);

      // Lunch
      meal = getRandomMeal(availableMeals.lunch, usedMealsToday, previousDayMeals);
      dailyMenu.lunch = meal;
      if (meal) usedMealsToday.push(meal);

      // Dinner
      meal = getRandomMeal(availableMeals.dinner, usedMealsToday, previousDayMeals);
      dailyMenu.dinner = meal;
      if (meal) usedMealsToday.push(meal);

      menu.push(dailyMenu);
      previousDayMeals = usedMealsToday;
    }
    setWeekMenu(menu);
  };

  const getRandomMeal = (mealList, usedMeals, previousDayMeals) => {
    const availableMeals = mealList.filter(
      (meal) =>
        !usedMeals.some((usedMeal) => usedMeal.id === meal.id) &&
        !previousDayMeals.some((prevMeal) => prevMeal.id === meal.id)
    );

    if (availableMeals.length === 0) {
      const fallbackMeals = mealList.filter(
        (meal) => !usedMeals.some((usedMeal) => usedMeal.id === meal.id)
      );
      if (fallbackMeals.length === 0) {
        if (mealList.length === 0) return null;
        return mealList[Math.floor(Math.random() * mealList.length)];
      }
      return fallbackMeals[Math.floor(Math.random() * fallbackMeals.length)];
    }

    return availableMeals[Math.floor(Math.random() * availableMeals.length)];
  };

  const handleAddMeal = () => {
    if (newMeal.name.trim() === '') return;
    const newId = Math.max(...Object.values(meals).flat().map(m => m.id), 0) + 1;
    const updatedMeals = { ...meals };
    updatedMeals[newMeal.type].push({ id: newId, name: newMeal.name });
    setMeals(updatedMeals);
    setNewMeal({ name: '', type: 'breakfast' });
  };

  const handleRemoveMeal = (mealId, mealType) => {
    const updatedMeals = { ...meals };
    updatedMeals[mealType] = updatedMeals[mealType].filter(meal => meal.id !== mealId);
    setMeals(updatedMeals);
  };

  useEffect(() => {
    if (weekMenu.length === 0) {
      generateMenu();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Weekly Meal Planner</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            Weekly Menu
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
            Manage Meals
          </button>
        </li>
      </ul>
      <div className="tab-content mt-3">
        {activeTab === 'menu' && (
          <div className="tab-pane fade show active">
            <h2>This Week's Menu</h2>
            <button className="btn btn-primary mb-3" onClick={generateMenu}>Generate New Menu</button>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                </tr>
              </thead>
              <tbody>
                {weekMenu.map(item => (
                  <tr key={item.day}>
                    <td>{item.day}</td>
                    <td>{item.breakfast?.name}</td>
                    <td>{item.lunch?.name}</td>
                    <td>{item.dinner?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'manage' && (
          <div className="tab-pane fade show active">
            <h2>Manage Meals</h2>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Add a New Meal</h5>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Meal Name"
                    value={newMeal.name}
                    onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <select
                    className="form-select"
                    value={newMeal.type}
                    onChange={e => setNewMeal({ ...newMeal, type: e.target.value })}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <button className="btn btn-success" onClick={handleAddMeal}>Add Meal</button>
              </div>
            </div>
            <div className="mt-4">
              <h3>Existing Meals</h3>
              {Object.keys(meals).map(mealType => (
                <div key={mealType}>
                  <h4>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
                  <ul className="list-group">
                    {meals[mealType].map(meal => (
                      <li key={meal.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {meal.name}
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMeal(meal.id, mealType)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
