import VideoCallImage from "@assets/images/videocallImage.png";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Toolbar,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convert } from "hangul-romanization";
import { Header, HEADER_HEIGHT } from "@components/index";
import avatarSonny from "@assets/images/avatar_sonny.png";
import avatarkarina from "@assets/images/avatar_karina.png";
import avatarChloe from "@assets/images/avatar_chloe.png";
import avatarDohyung from "@assets/images/avatar_dohyung.png";
import { useDispatch, useSelector } from "react-redux";
import { uploadNewSessionRequest } from "@store/ai/aiConsultSlice";
import styled from "styled-components";

import hallwayChloeVideo from "@assets/videos/hallway_chloe.mp4";
import hallwayDohyungVideo from "@assets/videos/hallway_dohyung.mp4";
import hallwaySonnyVideo from "@assets/videos/hallway_sonny.mp4";
import hallwayKarinaVideo from "@assets/videos/hallway_karina.mp4";

// SweetAlert2 임포트
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CircularProgress from "@mui/material/CircularProgress"; // MUI 로딩 스피너 추가

const MySwal = withReactContent(Swal);

const AiConsultEntryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [uname, setUname] = useState({
    value: "",
    error: false,
  });
  const [phoneNumber, setPhoneNumber] = useState({
    value: "",
    error: false,
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // 비디오 재생 상태 및 선택된 비디오
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hallwayVideo, setHallwayVideo] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false); // 비디오 준비 상태 추가
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar((prev) => (prev === avatar ? null : avatar));
  };

  const onChangeUname = (e) => {
    const value = e.target.value;
    const regex = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+$/;
    const valid = regex.test(value);
    setUname({
      value,
      error: !valid && value !== "",
    });
  };

  const onChangePhoneNumber = (e) => {
    const value = e.target.value;
    const isValid = /^[0-9]{11}$/.test(value);
    setPhoneNumber({
      value,
      error: value !== "" && !isValid,
    });
  };

  const onClickStart = async () => {
    let unameToUse = uname.value;
    const containsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(uname.value);
    if (containsKorean) {
      unameToUse = convert(uname.value).replace(/\s+/g, "");
    }
    console.log(
      "uname: ",
      unameToUse,
      ", phoneNum: ",
      phoneNumber.value,
      ", selectedAvatar: ",
      selectedAvatar
    );
    const formData = new FormData();
    formData.append("uname", unameToUse);
    formData.append("phoneNumber", phoneNumber.value);
    formData.append("selectedAvatar", selectedAvatar);

    setIsLoading(true); // 버튼을 비활성화

    try {
      await dispatch(uploadNewSessionRequest(formData)).unwrap();
    } catch (error) {
      console.error("세션 업로드 실패:", error);
      MySwal.fire({
        title: "오류",
        text: "세션 업로드에 실패했습니다. 다시 시도해주세요.",
        icon: "error",
        confirmButtonText: "확인",
      });
      setIsLoading(false); // 에러 발생 시 버튼을 다시 활성화
      return;
    }

    let hallwayVideoSrc;
    if (selectedAvatar === "sonny") {
      hallwayVideoSrc = hallwaySonnyVideo;
    } else if (selectedAvatar === "karina") {
      hallwayVideoSrc = hallwayKarinaVideo;
    } else if (selectedAvatar === "chloe") {
      hallwayVideoSrc = hallwayChloeVideo;
    } else if (selectedAvatar === "dohyung") {
      hallwayVideoSrc = hallwayDohyungVideo;
    }

    if (hallwayVideoSrc) {
      // 비디오 사전 로드
      const video = document.createElement("video");
      video.src = hallwayVideoSrc;
      video.preload = "auto";
      video.oncanplaythrough = () => {
        setHallwayVideo(hallwayVideoSrc);
        setIsVideoReady(true); // 비디오 준비 완료
        setIsVideoPlaying(true);
      };
      video.onerror = () => {
        console.error("비디오 로드 실패");
        MySwal.fire({
          title: "오류",
          text: "비디오를 로드하는 데 실패했습니다. 다시 시도해주세요.",
          icon: "error",
          confirmButtonText: "확인",
        });
        setIsLoading(false); // 비디오 로드 실패 시 버튼을 다시 활성화
      };
    } else {
      // 아바타가 선택되지 않았거나 해당 비디오가 없는 경우 네비게이트
      navigate(
        `/ai-consult/${unameToUse}?phoneNumber=${phoneNumber.value}&selectedAvatar=${selectedAvatar}`
      );
      setIsLoading(false); // 네비게이트 후 버튼을 다시 활성화 (필요에 따라)
    }
  };

  const onVideoEnded = () => {
    let unameToUse = uname.value;
    const containsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(uname.value);
    if (containsKorean) {
      unameToUse = convert(uname.value).replace(/\s+/g, "");
    }
    navigate(
      `/ai-consult/${unameToUse}?phoneNumber=${phoneNumber.value}&selectedAvatar=${selectedAvatar}`
    );
  };

  useEffect(() => {
    const isNameValid = uname.value !== "" && !uname.error;
    const isPhoneValid = phoneNumber.value !== "" && !phoneNumber.error;
    const isAvatarSelected = selectedAvatar !== null;
    setIsButtonEnabled(isNameValid && isPhoneValid && isAvatarSelected);
  }, [uname, phoneNumber, selectedAvatar]);

  return (
    <Container>
      <Header />
      <Box flex="1" display="flex" alignItems="center" justifyContent="center">
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" width="100%">
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <TextField
              required
              error={uname.error}
              value={uname.value}
              helperText={
                uname.error ? "이름은 숫자, 영문, 한글만 가능합니다." : ""
              }
              label="이름을 입력해주세요"
              onChange={onChangeUname}
              inputProps={{}}
              sx={{
                fontSize: { xs: "14px", md: "16px" },
                width: { xs: "70%", sm: "70%", md: "70%" },
                maxWidth: "400px",
                mb: 2,
              }}
              InputLabelProps={{
                required: false, // '*' 표시를 제거합니다.
              }}
            />

            <TextField
              required
              error={phoneNumber.error}
              value={phoneNumber.value}
              helperText={
                phoneNumber.error
                  ? "전화번호는 11자리의 숫자만 입력 가능합니다."
                  : ""
              }
              label="전화번호를 입력해주세요"
              onChange={onChangePhoneNumber}
              inputProps={{
                pattern: "[0-9]{11}",
                maxLength: 11,
                inputMode: "numeric",
              }}
              placeholder="01012345678"
              sx={{
                fontSize: { xs: "14px", md: "16px" },
                width: { xs: "70%", sm: "70%", md: "70%" },
                maxWidth: "400px",
              }}
              InputLabelProps={{
                required: false, // '*' 표시를 제거합니다.
              }}
            />
          </Box>

          <Box display="flex" justifyContent="center" gap={4}>
            {[
              { name: "dohyung", src: avatarDohyung },
              { name: "chloe", src: avatarChloe },
              { name: "sonny", src: avatarSonny },
              { name: "karina", src: avatarkarina },
            ].map((avatar) => (
              <Box
                key={avatar.name}
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxWidth: { xs: "150px", sm: "220px", md: "240px" },
                    cursor: "pointer",
                    border:
                      selectedAvatar === avatar.name
                        ? "5px solid #3399FF"
                        : "none",
                    // borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  alt={`Avatar ${avatar.name}`}
                  src={avatar.src}
                  onClick={() => handleAvatarClick(avatar.name)}
                />
              </Box>
            ))}
          </Box>

          <Box display="flex" justifyContent="center">
            <Button
              onClick={onClickStart}
              disabled={!isButtonEnabled || isLoading} // isLoading 상태 추가
              variant="contained"
              sx={{
                fontFamily: "SUIT Variable",
                backgroundColor: "#1976d2",
                color: "white",
                borderRadius: "25px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease-in-out, background-color 0.3s",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  transform: "scale(1.03)",
                },
                padding: { xs: "6px 14px", sm: "8px 16px", md: "10px 20px" },
                fontWeight: "bold",
                fontSize: { xs: "14px", sm: "16px", md: "20px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "상담 시작하기"
              )}
            </Button>
          </Box>
        </Stack>
      </Box>
      {/* 영상 오버레이 */}
      {isVideoPlaying && hallwayVideo && (
        <VideoOverlay>
          {!isVideoReady && (
            <LoadingContainer>
              <CircularProgress color="inherit" />
            </LoadingContainer>
          )}
          {isVideoReady && (
            <TransitionVideo
              src={hallwayVideo}
              autoPlay
              onEnded={onVideoEnded}
              controls={false}
            />
          )}
        </VideoOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

// 영상 오버레이 스타일 (배경색 제거 또는 투명하게 설정)
const VideoOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: transparent; */ /* 배경색 제거 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* 다른 모든 요소보다 위에 표시 */
`;

// 로딩 인디케이터 스타일
const LoadingContainer = styled.div`
  position: absolute;
  z-index: 10000; /* 비디오 위에 표시 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

// 영상 스타일
const TransitionVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default AiConsultEntryPage;