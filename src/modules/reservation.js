const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const movieURL = 'https://api.tvmaze.com/shows';
const reservationsURL = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3x4brqQTuutEhv5burqz/reservations/';
// id: 3x4brqQTuutEhv5burqz
const popUpBox = document.getElementById('popUpBox');

const postReservationsData = async (raw) => {
  const response = await fetch(reservationsURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset= UTF-8',
    },
    body: JSON.stringify(raw),
  }).then((res) => res.text())
    .then((data) => (data.error
      ? { error: true, info: data }
      : { error: false, info: data }))
    .catch((error) => ({ error: true, info: error }));
  return response;
};

const getReservationsData = async (movieId) => {
  const response = await fetch(`${reservationsURL}?item_id=${movieId}`).catch((err) => err);
  return response.json();
};

const reservationsDisplay = (movieId) => {
  popUpBox.querySelector('.reservationTable').innerHTML = '';
  getReservationsData(movieId).then((data) => {
    if (!data.error) {
      data.forEach((comment) => {
        popUpBox.querySelector('.reservationTable').innerHTML += `<li class="reservation-li"> ${comment.date_start} - ${comment.date_end} by ${comment.username}</li>`;
      });
    } else {
      popUpBox.querySelector('.reservationTable').innerHTML = 'no reservation yet!';
    }
  });
};

const getMovieData = async (movieID) => {
  const response = await fetch(`${movieURL}/${movieID}`, {
    method: 'GET',
    redirect: 'follow',
  })
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => error);
  return response;
};

const Reservationspopup = (movieID) => {
  getMovieData(movieID).then((result) => {
    popUpBox.innerHTML = `
    <span class="closeReservation"><img src="https://img.icons8.com/doodle/48/000000/delete-sign.png"/></span>
    <div class="reservation-skeleton">
    <div class="reservation-film-info">
    <h2 class="popupTitle">${result.name}</h2>
    <img src="${result.image.medium}" class="reservationImg">
    </div>
    <div>
    <ul>
      <li>Premiered: ${result.premiered}</li>
      <li>Ended: ${result.ended}</li>
      <li>Language: ${result.language}</li>
      <li>Type: ${result.type}</li>
    </ul>
    </div>
    <div class="reservation-info">
    <h3 class="reservationsTitle"> Reservations (<span class="reservationCounter">0</span>)</h3>
    <ul class="reservationTable"></ul>
    <form class="reservationForm">
      <h3>Add a reservation</h3>
      <input id="username" type="text" name="username" placeholder="Your name" required>
      <br>
      <input id="StartDate" type="date" name="StartDate" placeholder="Start date" required>
      <br>
      <input id="EndDate" type="date" name="EndDate" placeholder="End date" required>
      <br>
      <button class="reservationSubmit" type="submit">Submit</button>
    </form>
    </div>
    </div>
    `;
    popUpBox.style.display = 'flex';
    document.querySelector('.closeReservation').addEventListener('click', () => {
      popUpBox.style.display = 'none';
      popUpBox.innerHTML = '';
    });
    reservationsDisplay(movieID);
    const form = popUpBox.querySelector('.reservationForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = form.elements.username.value;
      const StartDate = form.elements.StartDate.value;
      const EndDate = form.elements.EndDate.value;
      postReservationsData({
        item_id: movieID,
        username: user,
        date_start: StartDate,
        date_end: EndDate,
      }).then(() => {
        reservationsDisplay(movieID);
        // counter++
        form.reset();
      });
    });
  });
};

export default Reservationspopup;