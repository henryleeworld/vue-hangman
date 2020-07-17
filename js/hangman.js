const maxLength = 40;
const allowedStrikes = 3;

const defaultStrikes = new Array(allowedStrikes).fill({
    icon: "⚪",
    guess: ""
});

const app = new Vue({
    el: "#app",
    data: () => ({
        letters: Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
        quotes: [],
        currentQuote: "",
        guesses: [],
        strikes: [...defaultStrikes],
        gameOver: false
    }),

    mounted() {
        fetch("https://type.fit/api/quotes").
        then(response => response.json()).
        then(fetchedQuotes => {
            fetchedQuotes = fetchedQuotes.filter(quote => quote.text.length <= maxLength);
            this.quotes = fetchedQuotes;
            this.pickAQuote();
        });
    },
    methods: {
        handleKeyPress(e) {
            const key = e.key.toUpperCase();
            if (key.length === 1 && key.match(/[a-zA-Z]/) && !this.guesses.includes(key)) {
                console.log(key);
                this.guess(key);
            }
        },
        pickAQuote() {
            const random = Math.floor(Math.random() * this.quotes.length);
            this.currentQuote = this.quotes[random].text.toUpperCase();
        },
        isRevealed(letter) {
            if (!letter.match(/[a-zA-Z\s]/)) {
                return letter;
            }
            return this.guesses.includes(letter) || this.gameOver ? letter : "_";
        },
        guess(letter) {
            console.log(letter);
            this.guesses.push(letter);
            if (!this.currentQuote.includes(letter)) {
                this.strikes.pop();
                this.strikes = [{
                    icon: "🚫",
                    guess: letter
                }, ...this.strikes];
            }
            if (this.strikeout || this.puzzleComplete) {
                this.gameOver = true;
                if (this.puzzleComplete) fireEmAll();
            }
        },
        newGame() {
            const confirmation = confirm("結束此遊戲並開始新的遊戲？");
            if (!confirmation) return;
            this.pickAQuote();
            this.guesses = [];
            this.strikes = [...defaultStrikes];
            this.gameOver = false;
        }
    },

    computed: {
        splitQuote() {
            return this.currentQuote.split(" ");
        },
        badGuesses() {
            return this.strikes.filter(s => s.guess).map(s => s.guess);
        },
        strikeout() {
            return this.badGuesses.length >= allowedStrikes;
        },
        puzzleComplete() {
            return this.unrevealed === 0;
        },
        unrevealed() {
            return [...this.currentQuote].filter(letter => {
                return letter.match(/[a-zA-Z]/) && !this.guesses.includes(letter);
            }).length;
        },
        message() {
            if (!this.gameOver) {
                return '☝️ 請選擇一個字母';
            } else if (this.strikeout) {
                return '❌ 你輸掉了這回合。再試一次？';
            } else if (this.puzzleComplete) {
                return '🎉 你贏了！';
            }
            return '😬 無法預料的錯誤狀態，也許嘗試一個新遊戲？';
        }
    }
});

let count = 200;
let defaults = {
    origin: {
        y: 0.5
    },
    colors: ["#ffd100", "#a7a8aa", "#ff6a13", "#e4002b", "#7ba7bc", "#34657f"]
};


const fire = (particleRatio, opts) => {
    confetti(
        Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        })
    );
};

const fireEmAll = () => {
    fire(0.25, {
        spread: 26,
        startVelocity: 55
    });

    fire(0.2, {
        spread: 60
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45
    });
};