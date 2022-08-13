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

export const findDomain = async (
    domainName: string
): Promise<DomainResultType[] | undefined> => {
    try {
        let query =
            "SELECT * FROM registeredDomains WHERE domainName = '" +
            domainName +
            "'";
        let domainId: number;
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
