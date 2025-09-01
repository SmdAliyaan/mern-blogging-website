import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const UserAuthForm = ({ type }) => {


    const userAuthThroughServer = (serverRoute, formData) => {
        // post request to server with axios

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + 
        serverRoute, formData)
        .then(({ data }) => {
            storeInsession("user", JSON.stringify(data));
            console.log(sessionStorage)
        })
        .catch(({ response }) => {
            toast.error(response.data.error);
        })

    }

    const handleSubmit = (e) => {

            e.preventDefault();

            let serverRoute = type == "sign-in" ? "/signin" : "/signup";

            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email

            let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

            // form data

            let form = new FormData(formElement);
            let formData = {};

            for (let [key, value] of form.entries()) {
                formData[key] = value;
            }

            // form validation

            let { fullname, email, password } = formData;


            if (fullname.length < 3) {
                return toast.error("Fullname must be at least 3 characters long")
            }

            if (!email.length) {
                return toast.error("Enter a valid email")
            }

            if (!emailRegex.test(email)) {
                return toast.error("Email is invalid")
            }

            if (!passwordRegex.test(password)) {
                return toast.error("Password is invalid")
            }


            userAuthThroughServer(serverRoute, formData);

    }


        return (
            <AnimationWrapper keyvalue={type}>
                <section className="h-cover flex items-center justify-center">
                    <Toaster />
                    <form id="formElement" className="w-[80%] max-w-[400px]">
                        <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                            {type === "sign-in" ? "Welcome back" : "Join us today"}
                        </h1>

                        {
                            type != "sign-in" ?
                                <InputBox
                                    name="fullname"
                                    type="text"
                                    placeholder="Full Name"
                                    icon="fi-rr-user"
                                />
                                : ""
                        }

                        <InputBox
                            name="email"
                            type="email"
                            placeholder="Email"
                            icon="fi-rr-envelope"
                        />

                        <InputBox
                            name="password"
                            type="password"
                            placeholder="Password"
                            icon="fi-rr-lock"
                        />

                        <button className="btn-dark center mt-14 "
                            type="submit"
                            onClick={handleSubmit}
                        >
                            {type.replace("-", " ")}
                        </button>

                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <hr className="w-1/2 border-black" />
                            <p>or</p>
                            <hr className="w-1/2 border-black" />
                        </div>

                        <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
                            <img src={googleIcon} className="w-5" />
                            continue with google
                        </button>

                        {
                            type == "sign-in" ?
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Don't have an account?
                                    <Link to="/signup" className="underline text-black text-xl ml-1">
                                        Sign up
                                    </Link>
                                </p>
                                :
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Already have an account?
                                    <Link to="/signin" className="underline text-black text-xl ml-1">
                                        Sign in
                                    </Link>
                                </p>
                        }

                    </form>
                </section>
            </AnimationWrapper>
        )
    }

    export default UserAuthForm;