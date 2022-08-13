import { Connect, Query } from "../config/mysql";
import { connection } from "../database/db";
import logging from "../config/logging";

type DomainResultType = { domainId: number; domainName: string };
type UserResultType = {
    userId: number;
    userName: string;
    email: string;
    password: string;
    newAccount: number;
};

type DomainToUsersType = {
    domainId: number;
    email: string;
    isAdmin: number;
};
type PageOfDomainType = {
    id: number;
    domainId: number;
    pageName: string;
};

type CommentType = {
    commentsId: number;
    pageOfDomainId: number;
    userId: number;
    message: string;
    elementIdentifier: string;
};

type QueryType = {
    pageNumber: number;
    pageOfDomain: string;
    domain: string;
    username: string;
    idx: number;
};

export const findDomain = async (
    domainName: string
): Promise<DomainResultType[] | undefined> => {
    try {
        let query =
            "SELECT * FROM registeredDomains WHERE domainName = '" +
            domainName +
            "'";
        const results = (await Query(connection!, query)) as DomainResultType[];
        return results;
    } catch (error: any) {
        logging.error("FIND_DOMAIN", error);
    }
};
export const addNewDomain = async (
    domainName: string
): Promise<DomainResultType[] | undefined> => {
    try {
        const query =
            "INSERT INTO registeredDomains (domainName) VALUES ('" +
            domainName +
            "')";
        const results = (await Query(connection!, query)) as DomainResultType[];
        return results;
    } catch (error: any) {
        logging.error("FIND_DOMAIN", error);
    }
};

export const deleteDomainUsers = async (domainId: number): Promise<void> => {
    try {
        const query = `DELETE FROM domainToUsers WHERE domainId = ${domainId}`;
        await Query(connection!, query);
    } catch (error: any) {
        logging.error("DELETE_DOMAIN_USER", error);
    }
};

export const addAllowedUsers = async (
    domainId: number,
    email: string
): Promise<void> => {
    try {
        const query = `INSERT INTO domainToUsers (domainId, email, isAdmin) VALUES (${domainId}, '${email}', 0)`;
        await Query(connection!, query);
    } catch (error: any) {
        logging.error("ADD_ALLOWED_USER", error);
    }
};

export const addAdminUsers = async (
    domainId: number,
    email: string
): Promise<void> => {
    let query = `DELETE FROM domainToUsers WHERE domainId = ${domainId} AND email = '${email}'`;
    await Query(connection!, query);
    query = `INSERT INTO domainToUsers (domainId, email, isAdmin) VALUES (${domainId}, '${email}', 1)`;
    await Query(connection!, query);
};

export const findUser = async (
    email: string
): Promise<UserResultType[] | undefined> => {
    try {
        let query = `SELECT * FROM users WHERE email = '${email}'`;
        const results = (await Query(connection!, query)) as UserResultType[];
        if (results.length === 0) {
            query = `SELECT * FROM users WHERE userName = '${email}'`;
            const results = (await Query(
                connection!,
                query
            )) as UserResultType[];
        }
        return results;
    } catch (error: any) {
        logging.error("FIND_USERS", error);
    }
};

export const findUserToDomain = async (
    domain: string,
    email: string
): Promise<DomainToUsersType[] | undefined> => {
    try {
        let query = `SELECT * FROM domainToUsers WHERE domainId = (SELECT domainId FROM registeredDomains WHERE domainName = '${domain}') AND email = '${email}'`;
        const results = (await Query(
            connection!,
            query
        )) as DomainToUsersType[];
        return results;
    } catch (error: any) {
        logging.error("FIND_USER_TO_DOMAIN", error);
    }
};

export const addUser = async (
    userName: string,
    email: string,
    password: string
): Promise<void> => {
    try {
        const query = `INSERT INTO users (userName, email, password) VALUES ('${userName}', '${email}', '${password}')`;
        await Query(connection!, query);
    } catch (error: any) {
        logging.error("CREATE_USER", error);
    }
};

export const getUserById = async (
    userId: number
): Promise<UserResultType[] | undefined> => {
    try {
        const query = `SELECT * FROM users WHERE userId = ${userId}`;
        const results = (await Query(connection!, query)) as UserResultType[];
        return results;
    } catch (error: any) {
        logging.error("GET_USER_BY_ID", error);
    }
};

export const getPageOfDomain = async (
    pageName: string
): Promise<PageOfDomainType[] | undefined> => {
    try {
        const query = `SELECT * FROM pagesOfDomain WHERE pageName = '${pageName}'`;
        let pageResult = (await Query(
            connection!,
            query
        )) as PageOfDomainType[];
        return pageResult;
    } catch (error: any) {
        logging.error("GET_PAGE_OF_DOMAIN", error);
    }
};

export const insertIntoPagesOfDomain = async (
    pageName: string,
    domainId: number
): Promise<PageOfDomainType[] | undefined> => {
    const query = `INSERT INTO pagesOfDomain (pageName, domainId) VALUES ('${pageName}', ${domainId})`;
    const results = (await Query(connection!, query)) as PageOfDomainType[];
    return results;
};

export const insertComment = async (
    pageId: number,
    userId: number,
    comment: string,
    itemBeingCommented: string
): Promise<void> => {
    try {
        const query = `INSERT INTO comments (pageOfDomainId, userId, message, elementIdentifier, created_at) VALUES (${pageId}, ${userId}, '${comment}', '${itemBeingCommented}', '${new Date().toISOString()}')`;
        (await Query(connection!, query)) as CommentType[];
    } catch (error: any) {
        logging.error("INSERT_COMMENT", error);
    }
};

export const getCommentsByPageNumber = async (
    pageOfDomain: string,
    filter: string,
    pageNumber: number
): Promise<CommentType[] | undefined> => {
    try {
        const query = `SELECT * FROM comments INNER JOIN users ON comments.userId=users.userId WHERE pageOfDomainId=(SELECT id FROM pagesOfDomain WHERE pageName = '${pageOfDomain}')${filter} ORDER BY comments.created_at DESC LIMIT ${
            pageNumber * 10
        }, ${pageNumber * 10 + 10}`;
        // console.log(query);
        const commentResults = (await Query(
            connection!,
            query
        )) as CommentType[];
        return commentResults;
    } catch (error: any) {
        logging.error("GET_COMMENTS_BY_PAGE_NUMBER", error);
    }
};
export const countOfLeftComments = async (
    pageOfDomain: string
): Promise<number | undefined> => {
    try {
        const query = `SELECT COUNT(*) FROM comments WHERE pageOfDomainId=(SELECT id FROM pagesOfDomain WHERE pageName = '${pageOfDomain}')`;
        const commentCount = (await Query(connection!, query)) as {
            commentsCountNumber: number;
        }[];
        let result = Object.values(
            JSON.parse(JSON.stringify(commentCount[0]))
        )[0] as number;
        return result;
    } catch (error: any) {
        logging.error("COUNT_OF_LEFT_COMMENTS", error);
    }
};

export const getCommentById = async (
    commentId: number
): Promise<CommentType[] | undefined> => {
    try {
        const query = `SELECT * FROM comments WHERE id = ${commentId}`;
        const results = (await Query(connection!, query)) as CommentType[];
        return results;
    } catch (error: any) {
        logging.error("GET_COMMENT_BY_ID", error);
    }
};

export const resolveComment = async (commentId: number): Promise<void> => {
    try {
        const query = `UPDATE comments SET resolved = 1 WHERE id = ${commentId}`;
        await Query(connection!, query);
    } catch (error: any) {
        logging.error("RESOLVE_COMMENT", error);
    }
};
