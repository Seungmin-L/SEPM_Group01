const db = require("../module/db"); // 데이터베이스
const bcrypt = require("bcrypt"); // 암호화

const handleLogin = async (req, res) => {
    const input_name = req.body.user;
    const input_pw = req.body.pwd;

    // 아래 코드는 백엔드로 input 데이터가 잘 전달되었는지 확인하기 위한 코드입니다~ 테스트해 보고 싶으시면 해제해서 사용해 보셔도 돼요 (세션 같은 건 비포 애프터가 잘 보입니다)
    console.log("input name: [", input_name, "]");
    console.log("input pw: [", input_pw, "]");
    // console.log("세션:", req.session);  // 라인 26이랑 비포 애프터 확인 용도

    // 대부분의 콘솔 로그는 제가 테스트해 보며 확인한 용도라서 주석으로 처리하고 진행하셔도 무방합니다
    const sql1 =
        "SELECT COUNT(*) AS result FROM users WHERE BINARY(name) = '" +
        input_name +
        "';"; // 데이터베이스 내에서 유저가 입력한 username이 존재하는지 확인
    db.query(sql1, function (err, data) {
        if (data[0].result == 1) {
            // 해당 유저의 username이 있을 때 (= 데이터베이스 내 COUNT 결과 값이 1)
            const sql2 =
                "SELECT pw FROM users WHERE BINARY(name) = '" +
                input_name +
                "';"; // 비밀번호 해시 값 조회
            db.query(sql2, async function (err, rows) {
                const validPassword = await bcrypt.compare(
                    input_pw,
                    rows[0].pw
                ); // 비교문
                if (err) {
                    console.log("console1:", err);
                } else if (validPassword) {
                    // 비밀번호가 일치하는 경우
                    console.log("비밀번호 일치:", validPassword); // (= true)
                    req.session.is_logined = true; // 로그인 상태도 true로 변경
                    req.session.username = input_name; // 세션 데이터베이스 내 유저 이름이라는 value의 해당 유저의 name을 넣음
                    console.log("세션:", req.session); // 라인 11이랑 비포 애프터 확인 용도
                    req.session.save(function () {
                        // 해당 세션 저장
                        res.redirect(`/`); // 재연결
                    });
                } else {
                    // 비밀번호가 일치하지 않는 경우
                    console.log("비밀번호 일치:", validPassword); // (= false)
                }
            });
        } else if (data[0].result == 0) {
            // 유저가 입력한 username이 존재하지 않는 경우
            console.log("결과:", data[0].result); // 0 (= 데이터베이스 내 COUNT 결과 값이 0)
            console.log("입력하신 id가 일치하지 않습니다.");
        } else {
            console.log("errorcode:", err);
        }
    });
};

module.exports = { handleLogin };
