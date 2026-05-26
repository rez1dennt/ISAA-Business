/* ── Burger — zero layout shift ── */
const burgerBtn = document.getElementById("burger-btn");
const mobileNav = document.getElementById("mobile-nav");
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  burgerBtn.classList.add("open");
  burgerBtn.setAttribute("aria-expanded", "true");
  mobileNav.classList.add("open");
  mobileNav.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  const scrollY = Math.abs(parseInt(document.body.style.top || "0"));
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  // Отключаем smooth scroll перед прыжком
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  // Включаем обратно
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, 0);
  menuOpen = false;
  burgerBtn.classList.remove("open");
  burgerBtn.setAttribute("aria-expanded", "false");
  mobileNav.classList.remove("open");
  mobileNav.setAttribute("aria-hidden", "true");
}

burgerBtn.addEventListener("click", () =>
  menuOpen ? closeMenu() : openMenu(),
);
document
  .querySelectorAll(".mobile-link")
  .forEach((l) => l.addEventListener("click", closeMenu));

/* ── Phone mask ── */

const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", onPhoneInput);
phoneInput.addEventListener("focus", onPhoneInput);
phoneInput.addEventListener("blur", onPhoneBlur);
phoneInput.addEventListener("keydown", onPhoneKeyDown);

function onPhoneInput(e) {
  const input = e.target;

  let digits = input.value.replace(/\D/g, "");

  // Если начали с 8 → меняем на 7
  if (digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }

  // Если номер не начинается с 7
  if (digits && !digits.startsWith("7")) {
    digits = "7" + digits;
  }

  // Максимум 11 цифр
  digits = digits.substring(0, 11);

  let formatted = "";

  if (digits.length > 0) {
    formatted = "+7";
  }

  if (digits.length > 1) {
    formatted += " (" + digits.substring(1, 4);
  }

  if (digits.length >= 5) {
    formatted += ") " + digits.substring(4, 7);
  }

  if (digits.length >= 8) {
    formatted += "-" + digits.substring(7, 9);
  }

  if (digits.length >= 10) {
    formatted += "-" + digits.substring(9, 11);
  }

  input.value = formatted;
}

function onPhoneBlur(e) {
  if (e.target.value === "+7") {
    e.target.value = "";
  }
}

function onPhoneKeyDown(e) {
  const input = e.target;

  // Полностью очищаем поле
  if (
    (e.key === "Backspace" || e.key === "Delete") &&
    input.value.replace(/\D/g, "").length <= 1
  ) {
    input.value = "";
  }
}

/* ── Form AJAX submit ── */
function submitForm() {
  const get = (id) => document.getElementById(id).value.trim();

  const fields = {
    fio: get("fio"),
    grad_year: get("grad_year"),
    language: get("language"),
    department: get("department"),
    phone: get("phone"),
    email: get("email"),
  };

  if (!fields.fio || fields.fio.length < 5) {
    showMsg("Пожалуйста, укажите ФИО полностью.", "error");
    return;
  }

  if (!/^[А-Яа-яЁёA-Za-z\s-]+$/.test(fields.fio)) {
    showMsg("ФИО должно содержать только буквы, пробелы и дефис.", "error");
    return;
  }

  if (!fields.grad_year) {
    showMsg("Пожалуйста, укажите год выпуска.", "error");
    return;
  }

  const year = Number(fields.grad_year);
  const currentYear = new Date().getFullYear();

  if (year < 1950 || year > currentYear + 1) {
    showMsg("Пожалуйста, укажите корректный год выпуска.", "error");
    return;
  }

  if (!fields.language || fields.language.length < 2) {
    showMsg("Пожалуйста, укажите язык.", "error");
    return;
  }

  if (!fields.department || fields.department.length < 2) {
    showMsg("Пожалуйста, укажите отделение.", "error");
    return;
  }

  const phoneDigits = fields.phone.replace(/\D/g, "");

  if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
    showMsg("Пожалуйста, укажите корректный телефон.", "error");
    return;
  }

  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email)) {
    showMsg("Пожалуйста, укажите корректный адрес электронной почты.", "error");
    return;
  }

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Отправляется…";

  const mailBody =
    `ФИО: ${fields.fio}\n` +
    `Год выпуска: ${fields.grad_year}\n` +
    `Язык: ${fields.language}\n` +
    `Отделение: ${fields.department}\n` +
    `Телефон: ${fields.phone}\n` +
    `E-mail: ${fields.email}`;

  const mailtoLink =
    `mailto:iaas.business@yandex.ru` +
    `?subject=${encodeURIComponent("Заявка на вступление — ИСАА Бизнес")}` +
    `&body=${encodeURIComponent(mailBody)}`;

  fetch("https://formsubmit.co/ajax/iaas.business@yandex.ru", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Заявка на вступление — ИСАА Бизнес",
      _captcha: "false",
      fio: fields.fio,
      "Год выпуска": fields.grad_year,
      Язык: fields.language,
      Отделение: fields.department,
      Телефон: fields.phone,
      email: fields.email,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success === "true" || data.success === true) {
        showMsg(
          "Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.",
          "success",
        );

        [
          "fio",
          "grad_year",
          "language",
          "department",
          "phone",
          "email",
        ].forEach((id) => {
          document.getElementById(id).value = "";
        });
      } else {
        window.location.href = mailtoLink;
        showMsg(
          "Откроется ваш почтовый клиент для отправки заявки.",
          "success",
        );
      }
    })
    .catch(() => {
      window.location.href = mailtoLink;
      showMsg("Откроется ваш почтовый клиент для отправки заявки.", "success");
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = "Отправить заявку";
    });
}

function showMsg(text, type) {
  const m = document.getElementById("form-message");
  m.textContent = text;
  m.className = type;
  m.style.display = "block";
}
