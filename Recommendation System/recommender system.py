import sys
import json
import pymysql
import numpy as np
import pandas as pd
from surprise import Dataset
from surprise import KNNWithMeans
from surprise import Reader
from surprise import accuracy
from surprise.model_selection import train_test_split

#Read data from stdin

def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])


def main():
    #get our data as an array from read_in()
    lines = read_in()

    # Recommendation Code
    #print('dsfsdf') #intentional error, bitch.
    # Creating Database Connection and store it in csv file

    conn = pymysql.connect(host="localhost",    # your host, usually localhost
                        user="root",         # your username
                        passwd="0000",  # your password
                        db="booker")        # name of the data base)
    conn.cursor()
    query = 'select * from booker.users_books_table'
    dataset = pd.read_sql_query(query, conn)

    # Import dataset csv file.
    #dataset = pd.read_csv('users_books_table.csv')
    # A reader is still needed but only the rating_scale param is requiered.
    reader = Reader(rating_scale=(1, 5))
    # The columns must correspond to user id, item id and ratings (in that order).
    data = Dataset.load_from_df(dataset, reader)

    #use user based true/false to switch between user-based or item-based collaborative filters
    trainset, testset = train_test_split(data, test_size=.2, random_state=42)
    algo = KNNWithMeans(
        k=19, sim_options={'name': 'pearson_baseline', 'user_based': False}, verbose=False)
    algo.fit(trainset)

    # Get a list of all book ids
    all_books_ids = dataset['book_id'].unique()
    # Get a list of book id that user id ='recommend_to_user_id' has rated
    recommend_to_user_id = lines
    book_id_rated_by_user = dataset.loc[dataset['user_id']
                                        == recommend_to_user_id, 'book_id']
    # Remove the book ids that user of id = 'recommended _to_user_if' has rated from the list of all book ids
    book_ids_to_predict = np.setdiff1d(all_books_ids, book_id_rated_by_user)

    new_books = [[recommend_to_user_id, book_id, 4.]      #
                for book_id in book_ids_to_predict]
    predicted_data_for_all_books = algo.test(new_books)

    predicted_ratings = np.array(
        [pred.est for pred in predicted_data_for_all_books])
    # Find the index of the maximum predicted rating .... argsort() [::-1][:n]  where 'n' is the number of recommended books.. [::-1] corresponding to descending order
    number_of_recommended_books = 6
    books_index_max_rating = predicted_ratings.argsort()[::-1][:number_of_recommended_books]
    # use this to find the corresponding book_id to recommend
    recommended_book_id = book_ids_to_predict[books_index_max_rating]

    ################ end of recommendation system python code

    #return the sum to the output stream
    print(recommended_book_id[0], recommended_book_id[1],
          recommended_book_id[2], recommended_book_id[3], recommended_book_id[4], recommended_book_id[5], lines)

#start process
if __name__ == '__main__':
    main()
