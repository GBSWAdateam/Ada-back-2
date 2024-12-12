const dotenv = require('dotenv');   
dotenv.config();

const express = require('express');
const { toASCII, toUnicode } = require('punycode/');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const cors = require('cors');
const initializeData = require('./map/initData');
const OpenAI = require('openai');
const TourAPI = require('./utils/tourAPI');

// JSON 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 라우터 및 미들웨어 임포트
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/index');
const mapRoutes = require('./routes/mapRoutes');
const autoLoginMiddleware = require('./middleware/autoLogin');
require('./passport/index')();


app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'googlelogin'),
    path.join(__dirname, 'naverlogin'),
    path.join(__dirname, 'kakaologin'),
    path.join(__dirname, 'map')
]);


// 라우터 임포트


const randomRoutes = require('./routes/randomRoutes');
const recommendedRoutes = require('./routes/recommendedRoutes');
const likedRoutes = require('./routes/likedRoutes');
const placesRouter = require('./routes/places');
const optimalRoutes = require('./routes/optimalRoutes');

// 라우터 설정
app.use('/api/places', randomRoutes);



// 나머지 설정들...


// 라우터 설정
app.use('/api/openai', optimalRoutes); // '/api/openai' 경로에 대해 openaiRoutes 사용
// pp를 app으로 수정
app.use('/api/places', randomRoutes);

// 나머지 설정들...


// 라우터 설정
app.use('/api/openai', optimalRoutes); 

// pp를 app으로 수정
app.use('/api/places', placesRouter); 
// app.js에 미들웨어 추가
app.use((req, res, next) => {
    res.locals.KAKAO_MAP_API_KEY = process.env.KAKAO_MAP_API_KEY;
    next();
});
// OpenAI API 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});





// MongoDB 연결 설정
mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB,
    // useNewUrlParser와 useUnifiedTopology 옵션 제거
}).then(() => {
    console.log('MongoDB에 연결되었습니다.');
    // 연결 성공 후 places 컬렉션 확인 및 초기화
    initializeData(require('./models/Place'));
}).catch(err => {
    console.error('MongoDB 연결 오류:', err);
});

// 모델 정의
const User = mongoose.model('User', require('./models/user').schema);
const GoogleUser = mongoose.model('GoogleUser', require('./models/googleUser').schema);
const NaverUser = mongoose.model('NaverUser', require('./models/naverUser').schema);
const KakaoUser = mongoose.model('KakaoUser', require('./models/kakaoUser').schema);
const Place = mongoose.model('Place', require('./models/Place').schema);
const LikedPlace = require('./models/LikedPlace');

// Express 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 정적 파일 설정
app.use('/map', express.static(path.join(__dirname, 'map')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'imgs')));
app.use(express.static(path.join(__dirname, 'naverlogin')));
app.use(express.static(path.join(__dirname, 'kakaologin')));
app.use(express.static(path.join(__dirname, 'googlelogin')));
app.use('/api/places', placesRouter);
app.use('/map', mapRoutes);
app.use('/api/places', randomRoutes); 




// View 엔진 설정
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'googlelogin'),
    path.join(__dirname, 'naverlogin'),
    path.join(__dirname, 'kakaologin'),
    path.join(__dirname, 'map')
]);

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        collection: 'sessions',
        ttl: 7 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

// Passport 설정
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 전역 모델 설정
app.set('dbConnection', mongoose.connection);
app.set('models', {
    User,
    GoogleUser,
    NaverUser,
    KakaoUser,
    Place
});

// 미들웨어
app.use(autoLoginMiddleware);

// 라우터
app.use('/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/', mapRoutes);
app.use('/', placesRouter);
app.use('/api/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/map', mapRoutes);
app.use('/api/places/random', randomRoutes);
app.use('/api/places/recommended', recommendedRoutes);
app.use('/api/places/liked', likedRoutes);
app.use('/api/places/optimal', optimalRoutes);

// 라우터 임포트


// 라우터 설정


// API 라우터 설정
app.use('/api/places', randomRoutes);
app.use('/api/places', recommendedRoutes);
app.use('/api/places', likedRoutes);
app.use('/api/places', optimalRoutes);



// EJS 파일 라우팅 설정
app.get('/random', (req, res) => {
    res.render('random');
});

app.get('/recommended', (req, res) => {
    res.render('recommended');
});

app.get('/liked', (req, res) => {
    res.render('liked');
});

app.get('/optimal', (req, res) => {
    res.render('optimal');
});

// CORS 헤더 설정
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 여행 경로 제공 API
app.post('/plan', async (req, res) => {
    const { start, end, keywords, budget, days } = req.body;

    try {
        // 키워드에 맞는 장소 검색
        const places = await Place.find({ keywords: { $in: keywords.split(',') } });

        // 예산 및 경비 산
        const estimatedCosts = calculateEstimatedCosts(days);

        // OpenAI를 사용해 최적 경로 생성
        const travelPlan = await generateTravelPlan(start, end, keywords, budget, days);

        res.json({
            travelPlan,
            estimatedCosts,
            places,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating travel plan');
    }
});

// 예상 경비 계산 함수
function calculateEstimatedCosts(days) {
    const averageFoodCost = 15; // 1끼당 평균 식비
    const averageAccommodationCost = 120; // 1박당 평균 숙박비
    const averageTransportCost = 60; // 이동당 평균 교통비

    return {
        food: averageFoodCost * (days * 3), // 하루 3끼 식사
        accommodation: averageAccommodationCost * days, // 숙박비
        transport: averageTransportCost, // 교통비
    };
}

// OpenAI를 사용하여 여행 경로 생성 함수
async function generateTravelPlan(start, end, keywords, budget, days) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `여행 경로를 제안해줘. 출발지는 ${start}, 목적지는 ${end}, 키워드는 ${keywords}, 예산은 ${budget}원, 여행 기간은 ${days}일이야.`,
                },
            ],  
        });

        // 응답 객체를 콘솔에 출력하여 확인
        console.log('OpenAI API 응답:', JSON.stringify(response, null, 2));

        // 응답 객체가 올바른지 확인
        if (response && response.choices && response.choices.length > 0) {
            const messageContent = response.choices[0].message.content;
            return messageContent;
        } else {
            throw new Error('OpenAI API 응답이 예상과 다릅니다.');
        }
    } catch (error) {
        console.error('OpenAI API 호출 오류:', error);
        if (error.code === 'insufficient_quota') {
            console.error('API 사용량 초과:', error.message);
            throw new Error('API 사용량이 초과되었습니다. 나중에 다시 시도해 주세요.');
        } else {
            console.error('OpenAI API 오류:', error);
            throw new Error('여행 경로 생성 중 오류가 발생했습니다.');
        }
    }
}


// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;