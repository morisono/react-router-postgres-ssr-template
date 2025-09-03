"use client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

interface ContactFormData {
    company: string;
    name: string;
    email: string;
    tel: string;
    message: string;
}

// FormData が application/x-www-form-urlencoded のみ受け付けるためのエンコード
function encode(data: ContactFormData) {
    return Object.entries(data)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&')
}

export default function Home() {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, isValid }
    } = useForm<ContactFormData>();
    const router = useRouter();

    const submit: SubmitHandler<ContactFormData> = async (values) => {
        return fetch("/api/contact", {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encode(values),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(`${ response.status } ${ response.statusText } ${ response.body }`);
                    alert("エラーにより送信できませんでした。内容をご確認の上、時間をおいてから再度お試しください。");
                    return false;
                } else {
                    router.push("/thanks");
                    return true;
                }
            })
            .catch((error) => {
                alert(error);
                return false;
            });
    };

    return (
        <main>
            <div className="content">
                <h1 className="title is-3">お問い合わせフォーム</h1>
                <form onSubmit={ handleSubmit(submit) }>
                    <div className="field">
                        <label className="label" htmlFor={ 'company' }>
                            貴社名 <span className="has-text-danger is-size-7">※必須</span>
                        </label>
                        <div className="control">
                            <input
                                className="input"
                                type={ 'text' }
                                id={ 'company' }
                                required={ true }
                                disabled={ isSubmitting }
                                { ...register("company", { required: true }) }
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor={ 'name' }>
                            お名前 <span className="has-text-danger is-size-7">※必須</span>
                        </label>
                        <div className="control">
                            <input
                                className="input"
                                type={ 'text' }
                                id={ 'name' }
                                required={ true }
                                disabled={ isSubmitting }
                                { ...register("name", { required: true }) }
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor={ 'email' }>
                            E-Mail <span className="has-text-danger is-size-7">※必須</span>
                        </label>
                        <div className="control">
                            <input
                                className="input"
                                type={ 'email' }
                                id={ 'email' }
                                required={ true }
                                disabled={ isSubmitting }
                                { ...register("email", { required: true }) }
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor={ 'tel' }>
                            お電話番号
                        </label>
                        <div className="control">
                            <input
                                className="input"
                                type={ 'tel' }
                                id={ 'tel' }
                                required={ false }
                                disabled={ isSubmitting }
                                { ...register("tel") }
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor={ 'message' }>
                            お問い合わせ内容 <span className="has-text-danger is-size-7">※必須</span>
                        </label>
                        <div className="control">
                                <textarea
                                    className="textarea"
                                    id={ 'message' }
                                    required={ true }
                                    disabled={ isSubmitting }
                                    { ...register("message", { required: true }) }
                                />
                        </div>
                    </div>
                    <div className="field">
                        <button
                            className={ `button is-link ${ isSubmitting ? "is-loading" : "" }` }
                            type="submit"
                            disabled={ isSubmitting || !isValid }
                        >送信
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
