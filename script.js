document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginScreen = document.getElementById('loginScreen');
    const registerScreen = document.getElementById('registerScreen');
    const mainNavbar = document.getElementById('mainNavbar');
    const mainContent = document.getElementById('mainContent');
    const form = document.getElementById('suggestionForm');
    const tableBody = document.querySelector('#suggestionsTable tbody');
    const totalItems = document.getElementById('totalItems');
    const categoryChartCanvas = document.getElementById('categoryChart').getContext('2d');
    const genreChartCanvas = document.getElementById('genreChart').getContext('2d');
    const ratingChartCanvas = document.getElementById('ratingChart').getContext('2d');
    const searchInput = document.getElementById('searchInput');
    const registerButton = document.getElementById('registerButton');
    const loggedInUser = document.getElementById('loggedInUser');
    const logoutButton = document.getElementById('logoutButton');
    let suggestions = JSON.parse(localStorage.getItem('suggestions')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let categoryChart, genreChart, ratingChart;
    let isAdmin = false;
  
    // Adicionar usuários padrão para teste
    if (users.length === 0) {
      users.push({ username: 'admin', password: 'admin', role: 'admin' });
      users.push({ username: 'member', password: 'member', role: 'member' });
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = loginForm.username.value;
      const password = loginForm.password.value;
      const user = users.find(user => user.username === username && user.password === password);
      if (user) {
        isAdmin = user.role === 'admin';
        loggedInUser.textContent = `Logged in as: ${username}`;
        loginScreen.style.display = 'none';
        mainNavbar.style.display = 'block';
        mainContent.style.display = 'block';
        if (isAdmin) {
          registerButton.style.display = 'block';
        }
        renderTable();
        renderCharts();
        if (isAdmin) {
          document.getElementById('userTable').style.display = 'block';
          renderUserTable();
        }
      } else {
        alert('Invalid username or password');
      }
    });
  
    registerButton.addEventListener('click', () => {
      mainContent.style.display = 'none';
      registerScreen.style.display = 'block';
    });
  
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUser = {
        username: registerForm.newUsername.value,
        password: registerForm.newPassword.value,
        role: registerForm.role.value
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      registerForm.reset();
      registerScreen.style.display = 'none';
      mainContent.style.display = 'block';
    });
  
    logoutButton.addEventListener('click', () => {
      isAdmin = false;
      loggedInUser.textContent = '';
      mainNavbar.style.display = 'none';
      mainContent.style.display = 'none';
      loginScreen.style.display = 'block';
    });
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newSuggestion = {
        tipo: form.tipo.value,
        name: form.name.value,
        genero: form.genero.value,
        descricao: form.descricao.value,
        link: form.link.value
      };
      suggestions.push(newSuggestion);
      localStorage.setItem('suggestions', JSON.stringify(suggestions));
      form.reset();
      renderTable();
      renderCharts();
    });
  
    searchInput.addEventListener('input', () => {
      renderTable();
    });
  
    function renderTable() {
      tableBody.innerHTML = '';
      const searchTerm = searchInput.value.toLowerCase();
      const filteredSuggestions = suggestions.filter(suggestion => suggestion.name.toLowerCase().includes(searchTerm));
      filteredSuggestions.forEach((suggestion, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${suggestion.tipo}</td>
          <td>${suggestion.name}</td>
          <td>${suggestion.genero}</td>
          <td>${suggestion.descricao}</td>
          <td><a href="${suggestion.link}" target="_blank">Link</a></td>
          <td>${isAdmin ? `<button class="btn btn-danger" onclick="deleteSuggestion(${index})">Delete</button>` : ''}</td>
        `;
        tableBody.appendChild(row);
      });
      totalItems.textContent = filteredSuggestions.length;
    }
  
    function renderCharts() {
      const categories = suggestions.map(s => s.tipo);
      const genres = suggestions.map(s => s.genero);
      const categoryCounts = categories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      const genreCounts = genres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});
      const categoryData = {
        labels: Object.keys(categoryCounts),
        datasets: [{
          label: 'Suggestions by Category',
          data: Object.values(categoryCounts),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
      const genreData = {
        labels: Object.keys(genreCounts),
        datasets: [{
          label: 'Suggestions by Genre',
          data: Object.values(genreCounts),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      };
      if (categoryChart) categoryChart.destroy();
      if (genreChart) genreChart.destroy();
      categoryChart = new Chart(categoryChartCanvas, {
        type: 'bar',
        data: categoryData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      genreChart = new Chart(genreChartCanvas, {
        type: 'pie',
        data: genreData
      });
    }
  
    window.deleteSuggestion = function(index) {
      suggestions.splice(index, 1);
      localStorage.setItem('suggestions', JSON.stringify(suggestions));
      renderTable();
      renderCharts();
    };
  
    function renderUserTable() {
      const userTableBody = document.getElementById('userTableBody');
      userTableBody.innerHTML = '';
      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            <button class="btn btn-warning" onclick="editUser(${index})">Edit</button>
            <button class="btn btn-danger" onclick="deleteUser(${index})">Delete</button>
          </td>
        `;
        userTableBody.appendChild(row);
      });
    }
  
    window.editUser = function(index) {
      const user = users[index];
      const newUsername = prompt("Enter new username:", user.username);
      const newRole = prompt("Enter new role (admin/member):", user.role);
      if (newUsername && newRole) {
        users[index] = { username: newUsername, role: newRole, password: user.password };
        localStorage.setItem('users', JSON.stringify(users));
        renderUserTable();
      }
    };
  
    window.deleteUser = function(index) {
      users.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(users));
      renderUserTable();
    };
  
    renderTable();
    renderCharts();
  });
  