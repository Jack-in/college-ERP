import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl py-12 px-10 max-w-md w-full text-center hover:shadow-md transition-shadow duration-300">
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-2">
                        <span className="text-4xl">🎓</span>
                        <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
                            edu<span className="text-brand-orange">merge</span>
                        </h1>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-brand-text mb-1">
                    Welcome Back
                </h2>
                <p className="text-brand-muted mb-8 text-sm">
                    Please select your role to access the ERP
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full bg-brand-blue hover:bg-brand-blueHover text-white font-medium py-3 px-6 rounded-md transition-colors"
                    >
                        Administrator
                    </button>

                    <button
                        onClick={() => navigate('/admission-officer')}
                        className="w-full bg-brand-blue hover:bg-brand-blueHover text-white font-medium py-3 px-6 rounded-md transition-colors"
                    >
                        Admission Officer
                    </button>

                    <button
                        onClick={() => navigate('/management')}
                        className="w-full bg-brand-blue hover:bg-brand-blueHover text-white font-medium py-3 px-6 rounded-md transition-colors"
                    >
                        Management
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Home