document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const proRiButton = document.getElementById('pro-ri-btn');
    const coursesContainer = document.getElementById('courses-container');
    const loginForm = document.getElementById('login-form');
    const activityForm = document.getElementById('activity-form');
    const activityList = document.getElementById('activity-list');
    const activityContainer = document.getElementById('activity-container');
    const receivedActivitiesContainer = document.getElementById('received-activities-container');
    const receivedActivityList = document.getElementById('received-activity-list');
    const resendActivityForm = document.getElementById('resend-activity-form');
    const professorLoginForm = document.getElementById('professor-login-form');
    const professorActivitiesContainer = document.getElementById('professor-activities-container');
    const professorActivityList = document.getElementById('professor-activity-list');
    const professorActivityForm = document.getElementById('professor-activity-form');

    let currentUser = null; // Variável para armazenar o usuário atual

    // Alternância de tema
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggleButton.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Mostrar botões de cursos
    proRiButton.addEventListener('click', () => {
        coursesContainer.classList.toggle('hidden');
        coursesContainer.setAttribute('aria-hidden', coursesContainer.classList.contains('hidden')); // Atualiza o atributo aria-hidden
    });

    // Login do usuário
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário
        currentUser = document.getElementById('username').value; // Armazena o nome do usuário
        loadActivities(); // Carrega as atividades do usuário
        activityContainer.classList.remove('hidden'); // Exibe a área de atividades
        loginForm.reset(); // Limpa o formulário de login
    });

    // Função para verificar se a atividade é antiga (mais de 7 dias)
    const isOldActivity = (timestamp) => {
        const now = Date.now();
        const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24); // Converte o tempo em dias
        return ageInDays > 7; // Considera atividades mais antigas que 7 dias
    };

    // Carregar atividades do localStorage para o usuário atual
    const loadActivities = () => {
        const activities = JSON.parse(localStorage.getItem(currentUser)) || [];
        activityList.innerHTML = ''; // Limpa a lista antes de carregar
        activities.forEach(activity => {
            const listItem = document.createElement('li');
            const timestamp = new Date(activity.timestamp).toLocaleString(); // Formatação da data e hora
            listItem.innerHTML = `${activity.title} para ${activity.recipient}: ${activity.description} (Enviado em: ${timestamp})`;
            
            // Botão de exclusão
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            if (isOldActivity(activity.timestamp)) {
                deleteButton.disabled = true; // Desabilita o botão se a atividade for antiga
                deleteButton.title = 'Esta atividade não pode ser excluída porque é mais antiga que 7 dias.';
            } else {
                deleteButton.addEventListener('click', () => {
                    deleteActivity(activity.title, currentUser);
                    loadActivities(); // Atualiza a lista de atividades
                });
            }

            listItem.appendChild(deleteButton);
            activityList.appendChild(listItem);
        });
        loadReceivedActivities(); // Carrega as atividades recebidas
    };

    // Carregar atividades recebidas do localStorage
    const loadReceivedActivities = () => {
        const receivedActivities = JSON.parse(localStorage.getItem('professor')) || [];
        receivedActivityList.innerHTML = ''; // Limpa a lista antes de carregar
        receivedActivities.forEach(activity => {
            const listItem = document.createElement('li');
            const timestamp = new Date(activity.timestamp).toLocaleString(); // Formatação da data e hora
            listItem.innerHTML = `${activity.title} de ${activity.from}: ${activity.description} (Recebido em: ${timestamp})`;

            // Botão de reenviar
            const resendButton = document.createElement('button');
            resendButton.textContent = 'Reenviar';
            resendButton.addEventListener('click', () => {
                document.getElementById('resend-activity-title').value = activity.title;
                document.getElementById('resend-activity-description').value = activity.description;
            });
            listItem.appendChild(resendButton);

            // Botão de exclusão
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            if (isOldActivity(activity.timestamp)) {
                deleteButton.disabled = true; // Desabilita o botão se a atividade for antiga
                deleteButton.title = 'Esta atividade não pode ser excluída porque é mais antiga que 7 dias.';
            } else {
                deleteButton.addEventListener('click', () => {
                    deleteReceivedActivity(activity.title);
                    loadReceivedActivities(); // Atualiza a lista de atividades recebidas
                });
            }
            listItem.appendChild(deleteButton);

            receivedActivityList.appendChild(listItem);
        });
        receivedActivitiesContainer.classList.remove('hidden'); // Exibe a área de atividades recebidas
    };

    // Excluir atividade do aluno
    const deleteActivity = (title, user) => {
        let activities = JSON.parse(localStorage.getItem(user)) || [];
        activities = activities.filter(activity => activity.title !== title); // Filtra as atividades
        localStorage.setItem(user, JSON.stringify(activities)); // Atualiza o localStorage
    };

    // Excluir atividade recebida do professor
    const deleteReceivedActivity = (title) => {
        let activities = JSON.parse(localStorage.getItem('professor')) || [];
        activities = activities.filter(activity => activity.title !== title); // Filtra as atividades recebidas
        localStorage.setItem('professor', JSON.stringify(activities)); // Atualiza o localStorage
    };

    // Enviar atividade
    activityForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário
        const recipient = document.getElementById('recipient').value;
        const title = document.getElementById('activity-title').value;
        const description = document.getElementById('activity-description').value;

        // Salvar a atividade no localStorage do aluno
        const activities = JSON.parse(localStorage.getItem(currentUser)) || [];
        activities.push({ title, recipient, description, timestamp: Date.now() }); // Adiciona timestamp
        localStorage.setItem(currentUser, JSON.stringify(activities));

        // Limpar o formulário
        activityForm.reset();
        loadActivities(); // Atualiza a lista de atividades
    });

    // Reenviar atividade
    resendActivityForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário
        const title = document.getElementById('resend-activity-title').value;
        const description = document.getElementById('resend-activity-description').value;

        // Adiciona a atividade reenviada no localStorage do professor
        const activities = JSON.parse(localStorage.getItem('professor')) || [];
        activities.push({ title, from: currentUser, description, timestamp: Date.now() }); // Adiciona timestamp
        localStorage.setItem('professor', JSON.stringify(activities));

        // Limpar o formulário de reenviar
        resendActivityForm.reset();
        loadReceivedActivities(); // Atualiza a lista de atividades recebidas
    });

    // Login do professor
    professorLoginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário
        const password = document.getElementById('professor-password').value;

        if (password === "2812") { // Verifica a senha do professor
            loadAllReceivedActivities(); // Carrega todas as atividades recebidas
            professorActivitiesContainer.classList.remove('hidden'); // Exibe a área de atividades do professor
            professorLoginForm.reset(); // Limpa o formulário
        } else {
            alert("Senha incorreta! Tente novamente.");
        }
    });

    // Carregar todas as atividades recebidas
    const loadAllReceivedActivities = () => {
        professorActivityList.innerHTML = ''; // Limpa a lista antes de carregar
        const users = Object.keys(localStorage); // Pega todas as chaves do localStorage

        users.forEach(user => {
            if (user !== currentUser && user !== "professor") { // Não mostra as atividades do professor logado
                const activities = JSON.parse(localStorage.getItem(user)) || [];
                activities.forEach(activity => {
                    const listItem = document.createElement('li');
                    const timestamp = new Date(activity.timestamp).toLocaleString(); // Formatação da data e hora
                    listItem.innerHTML = `Atividade de ${user}: ${activity.title} - ${activity.description} (Recebido em: ${timestamp})`;

                    // Botão de exclusão
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Excluir';
                    if (isOldActivity(activity.timestamp)) {
                        deleteButton.disabled = true; // Desabilita o botão se a atividade for antiga
                        deleteButton.title = 'Esta atividade não pode ser excluída porque é mais antiga que 7 dias.';
                    } else {
                        deleteButton.addEventListener('click', () => {
                            deleteReceivedActivity(activity.title);
                            loadAllReceivedActivities(); // Atualiza a lista de atividades do professor
                        });
                    }

                    listItem.appendChild(deleteButton);
                    professorActivityList.appendChild(listItem);
                });
            }
        });
    };

    // Enviar atividade para todos os usuários
    professorActivityForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário
        const title = document.getElementById('professor-activity-title').value;
        const description = document.getElementById('professor-activity-description').value;

        const users = Object.keys(localStorage); // Pega todas as chaves do localStorage

        users.forEach(user => {
            if (user !== "professor") { // Não envia para a própria conta do professor
                const activities = JSON.parse(localStorage.getItem(user)) || [];
                activities.push({ recipient: user, title, description, timestamp: Date.now() }); // Adiciona timestamp
                localStorage.setItem(user, JSON.stringify(activities));

                // Adiciona a atividade na lista de atividades do professor
                const listItem = document.createElement('li');
                listItem.innerHTML = `Atividade enviada para ${user}: ${title} - ${description} (Enviado em: ${new Date().toLocaleString()})`;
                professorActivityList.appendChild(listItem);
            }
        });

        // Limpa o formulário
        professorActivityForm.reset();
    });

    // Função para abrir link em nova aba
    function openInNewWindow(url) {
        window.open(url, '_blank');
    }

    // Adicionar o evento de clique para o botão do curso de Excel
    const excelButton = document.getElementById('excel-btn'); // Certifique-se de que este ID existe no seu HTML
    if (excelButton) {
        excelButton.addEventListener('click', () => {
            openInNewWindow('https://guia-basico-excel-5974tmg.gamma.site/');
        });
    }

    // Adicionar o evento de clique para o botão do curso de Word
    const wordButton = document.getElementById('word-btn'); // Certifique-se de que este ID existe no seu HTML
    if (wordButton) {
        wordButton.addEventListener('click', () => {
            openInNewWindow('https://tutorial-do-microsoft-wo-y7qgy7z.gamma.site/');
        });
    }
});
