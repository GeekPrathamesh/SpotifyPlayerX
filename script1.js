let currentAudio = new Audio();
let playBtn = document.querySelector("#play");
let previous = document.querySelector("#previous");
let songs;
let currFolder;
let songsUL = document.querySelector(".list-songs ul");
let albums;
let card_container = document.querySelector(".card-container");

async function callSong(folder) {
  songsUL.innerHTML = "";
  currFolder = folder;
  const response = await fetch(`/${folder}`);
  const responseText = await response.text();

  let div = document.createElement("div");
  div.innerHTML = responseText;
  let anchors = div.getElementsByTagName("a");
  // console.log(anchors);
  songs = [];
  for (let anchor of anchors) {
    if (anchor.href.endsWith(".mp3")) {
      songs.push(anchor.href.split(`/${folder}/`)[1]);
    }
  }

  for (let song of songs) {
    songsUL.innerHTML += `<li>
      <i class="fa-solid fa-music"></i>
      <div class="song-info">
        <p>${decodeURIComponent(song)}</p>
        <p><i>Bandu</i></p>
      </div>
      <i class="fa-solid fa-circle-play"></i>
    </li>`;
  }

  /////////event listner to all songs
  let lists = Array.from(document.querySelectorAll(".list-songs ul li"));
  lists.forEach((list) => {
    list.addEventListener("click", (event) => {
      let audioName = list
        .querySelector(".song-info")
        .firstElementChild.innerHTML.trim();
      console.log(audioName);
      playsong(audioName);
    });
  });
}
//////

const playsong = (audioName, pause = false) => {
  // audioName = encodeURIComponent(audioName);
  const audioURL = `/${currFolder}/` + audioName;

  console.log("Playing:", audioURL);

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(audioURL);
  if (!pause) {
    currentAudio.play();
    playBtn.classList.remove("fa-circle-play");
    playBtn.classList.add("fa-circle-pause");
  } else {
    playBtn.classList.remove("fa-circle-pause");
    playBtn.classList.add("fa-circle-play");
  }

  const decodedName = decodeURIComponent(audioName);
  document.querySelector(".song-Name").innerText = decodedName;
  document.querySelector(".song-time").innerText = "00:00 / 00:00";

  currentAudio.addEventListener("timeupdate", () => {
    const current = formatTime(currentAudio.currentTime);
    const total = formatTime(currentAudio.duration);
    document.querySelector(".song-time").innerText = `${current} / ${total}`;
    document.querySelector(".creekerball").style.left =
      (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
};

const main = async () => {
  await callSong("songs/ed-sheeran");
  playsong(songs[0], true);

  // console.log(songs);

  ////////////////ataching event listner to each previous play next song to access

  playBtn.addEventListener("click", () => {
    // if (!currentAudio) {
    //   alert("Play kar pehle song..");
    //   return;
    // }
    if (currentAudio.paused) {
      currentAudio.play();
      playBtn.classList.remove("fa-circle-play");
      playBtn.classList.add("fa-circle-pause");
    } else {
      currentAudio.pause();
      playBtn.classList.remove("fa-circle-pause");
      playBtn.classList.add("fa-circle-play");
    }
  });

  /////////////seeker movement

  document.querySelector(".creeker").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".creekerball").style.left = percent + "%";
    currentAudio.currentTime = (currentAudio.duration * percent) / 100;
  });

  ///////////////hamberger event listner
  document.querySelector(".hamberger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  /////////close x button for hamberger

  document.querySelector(".xmark").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  ///////////next song previous song

  previous.addEventListener("click", () => {
    currentAudio.pause();

    let idx = songs.indexOf(currentAudio.src.split("/").slice(-1)[0]);
    console.log(idx);
    if (idx > 0) {
      playsong(songs[idx - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentAudio.pause();

    let idx = songs.indexOf(currentAudio.src.split("/").slice(-1)[0]);
    console.log(idx);
    if (idx < songs.length) {
      playsong(songs[idx + 1]);
    }
  });

  //////////////volume control

  document.querySelector("#volume").addEventListener("change", (e) => {
    console.log(e.target.value);
    currentAudio.volume = e.target.value / 100;
    if (currentAudio.volume > 0) {
      try {
        document
          .querySelector(".volume-input .fa-solid")
          .classList.remove("fa-volume-xmark");
        document
          .querySelector(".volume-input .fa-solid")
          .classList.add("fa-volume-high");
      } catch (err) {
        console.error("Error toggling volume icon:", err);
      }
    }
  });

  ////////////////load playlist whenever any card clicked
  displayAlbums();

  ///////////////event listner to mute the track

  document
    .querySelector(".volume-input .fa-solid")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("fa-volume-high")) {
        e.target.classList.remove("fa-volume-high");
        e.target.classList.add("fa-volume-xmark");
        currentAudio.volume = 0;
        document.querySelector("#volume").value = 0;
      } else if (e.target.classList.contains("fa-volume-xmark")) {
        e.target.classList.remove("fa-volume-xmark");
        e.target.classList.add("fa-volume-high");
        document.querySelector("#volume").value = 40;

        currentAudio.volume = 0.4;
      }
    });
};

////////////display albums

main();

async function displayAlbums() {
  const response = await fetch(`/songs`);
  const responseText = await response.text();

  let div = document.createElement("div");
  div.innerHTML = responseText;
  let anchors = Array.from(div.getElementsByTagName("a"));
  // console.log(anchors);
  albums = [];
  for (let anchor of anchors) {
    if (anchor.href.includes("/songs/")) {
      albums.push(anchor.href.split("/").slice(-2)[0]);
      let album = anchor.href.split("/").slice(-2)[0];
      // console.log(albums)
      // // http://127.0.0.1:3000/songs/ab/
      let folders = await fetch(`/songs/${album}/info.json`);
      let response = await folders.json();
      // console.log(response)
      card_container.innerHTML += `<div class="card" data-folder="${album}">
              <img
                src="/songs/${album}/cover.jpg"
                alt="playlist coverpage"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
              <div class="play">
                <svg
                  class="play-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  />
                </svg>
              </div>
            </div>`;
    }
  }
  // console.log(albums)

  // songs = [];
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async (eachcardchoosen) => {
      console.log(e.dataset.folder);
      console.log("button click");
      await callSong(`songs/${e.dataset.folder}`);
      playsong(songs[0]);

      if (window.innerWidth <= 1250) {
        document.querySelector(".hamberger").click();
      }
    });
  });
}
