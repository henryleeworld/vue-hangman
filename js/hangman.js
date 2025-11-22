const maxLength = 40;
const allowedStrikes = 3;

const defaultStrikes = new Array(allowedStrikes).fill({
    icon: "⚪",
    guess: ""
});

const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
    setup() {
        const letters = ref(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
        const quotes = ref([]);
        const currentQuote = ref("");
        const guesses = ref([]);
        const strikes = ref([...defaultStrikes]);
        const gameOver = ref(false);

        const handleKeyPress = (e) => {
            const key = e.key.toUpperCase();
            if (key.length === 1 && key.match(/[A-Z]/) && !guesses.value.includes(key)) {
                guess(key);
            }
        };

        fetch("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json")
        .then(resp => resp.json())
        .then(fetched => {
            fetched = fetched
                .map(q => ({
                    text: q.text || q.quoteText || "",
                    author: q.author || q.quoteAuthor || "不明"
                }))
                .filter(q => q.text && q.text.length <= maxLength);

            quotes.value = fetched;
            pickAQuote();
        });

        const pickAQuote = () => {
            const random = Math.floor(Math.random() * quotes.value.length);
            currentQuote.value = quotes.value[random].text.toUpperCase();
        };

        const isRevealed = (letter) => {
            if (!letter.match(/[A-Z\s]/)) return letter;
            return guesses.value.includes(letter) || gameOver.value ? letter : "_";
        };

        const guess = (letter) => {
            guesses.value.push(letter);

            if (!currentQuote.value.includes(letter)) {
                strikes.value.pop();
                strikes.value = [
                    { icon: "🚫", guess: letter },
                    ...strikes.value
                ];
            }

            if (strikeout.value || puzzleComplete.value) {
                gameOver.value = true;
                if (puzzleComplete.value) fireEmAll();
            }
        };

        const newGame = () => {
            const confirmation = confirm("結束此遊戲並開始新的遊戲？");
            if (!confirmation) return;

            pickAQuote();
            guesses.value = [];
            strikes.value = [...defaultStrikes];
            gameOver.value = false;
        };

        const splitQuote = computed(() => currentQuote.value.split(" "));
        const badGuesses = computed(() => strikes.value.filter(s => s.guess).map(s => s.guess));
        const strikeout = computed(() => badGuesses.value.length >= allowedStrikes);
        const unrevealed = computed(() =>
            [...currentQuote.value].filter(
                l => l.match(/[A-Z]/) && !guesses.value.includes(l)
            ).length
        );
        const puzzleComplete = computed(() => unrevealed.value === 0);

        const message = computed(() => {
            if (!gameOver.value) return "☝️ 請選擇一個字母";
            if (strikeout.value) return "❌ 你輸掉了這回合。再試一次？";
            if (puzzleComplete.value) return "🎉 你贏了！";
            return "😬 無法預料的錯誤狀態，也許嘗試一個新遊戲？";
        });

        return {
            letters,
            quotes,
            currentQuote,
            guesses,
            strikes,
            gameOver,
            splitQuote,
            badGuesses,
            strikeout,
            unrevealed,
            puzzleComplete,
            message,
            isRevealed,
            guess,
            newGame
        };
    }
}).mount("#app");