import json


def save_data(data):
    print(data)
    json_data = json.dumps(data)

    with open("data.json", "w") as outfile:
        outfile.write(json_data)


letters = "ABCDEFG"

data = []
for idx in range(9, 51):
    print("\n", "-" * 5, f"Card {idx}", "-" * 5)
    pieces = {}
    letter = 0
    while letter < len(letters):
        i = letters[letter]

        piece_code = input(f"Piece: {i}: ")
        if piece_code == "q":
            save_data(data)
            quit(1)
        elif piece_code != "b":
            pieces[i] = piece_code
            letter += 1
        else:
            letter -= 1
            letter = 0 if letter < 0 else letter

    card = {"id": idx, "level": 1, "pieces": pieces}
    data.append(card)
save_data(data)
